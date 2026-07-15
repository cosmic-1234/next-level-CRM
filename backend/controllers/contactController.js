const User = require('../models/User');
const Rental = require('../models/Rental');
const Review = require('../models/Review');
const ForumPost = require('../models/ForumPost');
const SupportTicket = require('../models/SupportTicket');
const Note = require('../models/Note');
const Interaction = require('../models/Interaction');
const AuditLog = require('../models/AuditLog');

// Helper to log audit actions
const logAudit = async (actorId, targetId, targetType, action, beforeValues, afterValues) => {
  try {
    await AuditLog.create({
      action,
      actor: actorId,
      target: targetId,
      targetType,
      beforeValues,
      afterValues
    });
  } catch (error) {
    console.error('Audit Logging failed:', error);
  }
};

// @desc    List members with search, filters, pagination
// @route   GET /api/crm/contacts
const getContacts = async (req, res) => {
  try {
    const { search, lifecycleStage, acquisitionSource, assignedOwner, tag, page = 1, limit = 10 } = req.query;

    const query = { role: 'user' }; // CRM manages standard users/readers

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (lifecycleStage) query.lifecycleStage = lifecycleStage;
    if (acquisitionSource) query.acquisitionSource = acquisitionSource;
    if (assignedOwner) query.assignedOwner = assignedOwner === 'null' ? null : assignedOwner;
    if (tag) query.tags = tag;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const contacts = await User.find(query)
      .populate('assignedOwner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      contacts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('CRM Get Contacts error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving contacts.' });
  }
};

// @desc    Get detailed Member 360 Profile
// @route   GET /api/crm/contacts/:id
const getContactDetails = async (req, res) => {
  try {
    const contact = await User.findById(req.params.id)
      .populate('assignedOwner', 'name email')
      .populate('currentlyReading', 'title author cover');

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Retrieve associated data in parallel
    const [rentals, reviews, posts, tickets, notes, interactions] = await Promise.all([
      Rental.find({ user: contact._id }).populate('book', 'title author cover').sort({ createdAt: -1 }),
      Review.find({ user: contact._id }).populate('book', 'title author').sort({ createdAt: -1 }),
      ForumPost.find({ author: contact._id }).sort({ createdAt: -1 }),
      SupportTicket.find({ user: contact._id }).sort({ createdAt: -1 }),
      Note.find({ user: contact._id }).populate('author', 'name').sort({ createdAt: -1 }),
      Interaction.find({ user: contact._id }).populate('admin', 'name').sort({ createdAt: -1 })
    ]);

    // Calculate dynamic stats
    const totalSpent = rentals
      .filter(r => r.status === 'returned' || r.status === 'active')
      .reduce((sum, r) => sum + r.totalCost, 0);

    res.json({
      success: true,
      data: {
        contact,
        rentals,
        reviews,
        posts,
        tickets,
        notes,
        interactions,
        stats: {
          totalRentalsCount: rentals.length,
          totalSpent,
          reviewsCount: reviews.length,
          forumPostsCount: posts.length,
          supportTicketsCount: tickets.length
        }
      }
    });
  } catch (error) {
    console.error('CRM Get Contact details error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving member 360 profile.' });
  }
};

// @desc    Update member parameters (lifecycleStage, tags, assignedOwner)
// @route   PATCH /api/crm/contacts/:id
const updateContact = async (req, res) => {
  try {
    const { lifecycleStage, assignedOwner, tags } = req.body;
    const contact = await User.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const beforeValues = {
      lifecycleStage: contact.lifecycleStage,
      assignedOwner: contact.assignedOwner,
      tags: [...contact.tags]
    };

    if (lifecycleStage) contact.lifecycleStage = lifecycleStage;
    if (assignedOwner !== undefined) contact.assignedOwner = assignedOwner || null;
    if (tags) contact.tags = tags;

    await contact.save();
    
    const afterValues = {
      lifecycleStage: contact.lifecycleStage,
      assignedOwner: contact.assignedOwner,
      tags: [...contact.tags]
    };

    // Log administrative change
    await logAudit(
      req.user._id,
      contact._id,
      'User',
      'UPDATE_CONTACT_CRM',
      beforeValues,
      afterValues
    );

    res.json({
      success: true,
      message: 'Member profile updated successfully.',
      contact
    });
  } catch (error) {
    console.error('CRM Update Contact error:', error);
    res.status(500).json({ success: false, message: 'Server error updating member.' });
  }
};

// @desc    Add admin note to contact
// @route   POST /api/crm/contacts/:id/notes
const addContactNote = async (req, res) => {
  try {
    const { body, isPinned } = req.body;
    if (!body) {
      return res.status(400).json({ success: false, message: 'Note body is required.' });
    }

    const note = await Note.create({
      body,
      isPinned: isPinned || false,
      author: req.user._id,
      user: req.params.id
    });

    const populated = await Note.findById(note._id).populate('author', 'name');

    await logAudit(
      req.user._id,
      req.params.id,
      'User',
      'ADD_CONTACT_NOTE',
      null,
      { noteId: note._id, body }
    );

    res.status(201).json({ success: true, note: populated });
  } catch (error) {
    console.error('CRM Add Note error:', error);
    res.status(500).json({ success: false, message: 'Server error writing note.' });
  }
};

// @desc    Delete contact note
// @route   DELETE /api/crm/notes/:noteId
const deleteContactNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    await Note.findByIdAndDelete(req.params.noteId);

    await logAudit(
      req.user._id,
      note.user,
      'User',
      'DELETE_CONTACT_NOTE',
      { body: note.body },
      null
    );

    res.json({ success: true, message: 'Note removed successfully.' });
  } catch (error) {
    console.error('CRM Delete Note error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting note.' });
  }
};

// @desc    Add interaction log to contact
// @route   POST /api/crm/contacts/:id/interactions
const addContactInteraction = async (req, res) => {
  try {
    const { type, summary, channel } = req.body;
    if (!type || !summary || !channel) {
      return res.status(400).json({ success: false, message: 'Type, summary, and channel are required.' });
    }

    const interaction = await Interaction.create({
      type,
      summary,
      channel,
      user: req.params.id,
      admin: req.user._id
    });

    const populated = await Interaction.findById(interaction._id).populate('admin', 'name');

    await logAudit(
      req.user._id,
      req.params.id,
      'User',
      'ADD_CONTACT_INTERACTION',
      null,
      { type, summary }
    );

    res.status(201).json({ success: true, interaction: populated });
  } catch (error) {
    console.error('CRM Add Interaction error:', error);
    res.status(500).json({ success: false, message: 'Server error writing interaction.' });
  }
};

module.exports = {
  getContacts,
  getContactDetails,
  updateContact,
  addContactNote,
  deleteContactNote,
  addContactInteraction,
  logAudit
};
