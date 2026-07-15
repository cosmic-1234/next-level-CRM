const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Rental = require('../models/Rental');
const { logAudit } = require('./contactController');

// @desc    List support tickets with filters
// @route   GET /api/crm/tickets
const getTickets = async (req, res) => {
  try {
    const { status, priority, category, assignedAdmin } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedAdmin) {
      query.assignedAdmin = assignedAdmin === 'null' ? null : assignedAdmin;
    }

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email phone')
      .populate('assignedAdmin', 'name email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    console.error('CRM Get Tickets error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving tickets.' });
  }
};

// @desc    Create a Support Ticket (user-facing or admin-created)
// @route   POST /api/crm/tickets
const createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, userId, rentalId, bookId } = req.body;

    if (!subject || !description || !category) {
      return res.status(400).json({ success: false, message: 'Subject, description, and category are required.' });
    }

    // Determine target user (defaults to current authed user if user-facing, or explicitly specified if admin-created)
    const targetUserId = userId || req.user._id;

    const ticket = await SupportTicket.create({
      subject,
      description,
      category,
      priority: priority || 'medium',
      user: targetUserId,
      rental: rentalId || null,
      book: bookId || null,
      status: 'open',
      messages: [{
        sender: req.user._id,
        body: description,
        isInternal: false
      }]
    });

    const populated = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email phone')
      .populate('book', 'title author');

    await logAudit(
      req.user._id,
      ticket._id,
      'SupportTicket',
      'CREATE_TICKET',
      null,
      { subject, category }
    );

    res.status(201).json({ success: true, ticket: populated });
  } catch (error) {
    console.error('CRM Create Ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error filing support ticket.' });
  }
};

// @desc    Get Ticket details + thread
// @route   GET /api/crm/tickets/:id
const getTicketDetails = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email phone avatar address lifecycleStage tags')
      .populate('assignedAdmin', 'name email')
      .populate('book', 'title author cover')
      .populate('rental')
      .populate('messages.sender', 'name email avatar role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('CRM Get Ticket details error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving ticket.' });
  }
};

// @desc    Add reply message to ticket
// @route   POST /api/crm/tickets/:id/messages
const addTicketMessage = async (req, res) => {
  try {
    const { body, isInternal } = req.body;
    if (!body) {
      return res.status(400).json({ success: false, message: 'Reply content is required.' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    const message = {
      sender: req.user._id,
      body,
      isInternal: isInternal || false
    };

    ticket.messages.push(message);

    // Auto update status if client/admin replies
    if (req.user.role === 'admin') {
      ticket.status = 'waiting-on-user';
    } else {
      ticket.status = 'in-progress';
    }

    await ticket.save();

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('messages.sender', 'name email avatar role');

    const addedMessage = populatedTicket.messages[populatedTicket.messages.length - 1];

    res.status(201).json({ success: true, message: addedMessage, ticketStatus: ticket.status });
  } catch (error) {
    console.error('CRM Reply Ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error sending message.' });
  }
};

// @desc    Update Ticket properties (status, assign, priority, resolution)
// @route   PATCH /api/crm/tickets/:id
const updateTicket = async (req, res) => {
  try {
    const { status, assignedAdmin, priority, resolutionNotes } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    const beforeValues = {
      status: ticket.status,
      assignedAdmin: ticket.assignedAdmin,
      priority: ticket.priority,
      resolutionNotes: ticket.resolutionNotes
    };

    if (status) ticket.status = status;
    if (assignedAdmin !== undefined) ticket.assignedAdmin = assignedAdmin || null;
    if (priority) ticket.priority = priority;
    if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes || '';

    await ticket.save();

    const afterValues = {
      status: ticket.status,
      assignedAdmin: ticket.assignedAdmin,
      priority: ticket.priority,
      resolutionNotes: ticket.resolutionNotes
    };

    await logAudit(
      req.user._id,
      ticket._id,
      'SupportTicket',
      'UPDATE_TICKET',
      beforeValues,
      afterValues
    );

    const populated = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email phone')
      .populate('assignedAdmin', 'name email')
      .populate('book', 'title author');

    res.json({ success: true, message: 'Ticket updated successfully.', ticket: populated });
  } catch (error) {
    console.error('CRM Update Ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error updating ticket properties.' });
  }
};

module.exports = {
  getTickets,
  createTicket,
  getTicketDetails,
  addTicketMessage,
  updateTicket
};
