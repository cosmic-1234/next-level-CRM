const Segment = require('../models/Segment');
const User = require('../models/User');
const Rental = require('../models/Rental');
const { logAudit } = require('./contactController');

// @desc    List segments
// @route   GET /api/crm/segments
const getSegments = async (req, res) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 });
    res.json({ success: true, segments });
  } catch (error) {
    console.error('CRM Get Segments error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving segments.' });
  }
};

// @desc    Create segment
// @route   POST /api/crm/segments
const createSegment = async (req, res) => {
  try {
    const { name, filterCriteria, autoRefresh } = req.body;
    if (!name || !filterCriteria) {
      return res.status(400).json({ success: false, message: 'Name and filter criteria are required.' });
    }

    const segment = await Segment.create({
      name,
      filterCriteria,
      autoRefresh: autoRefresh !== undefined ? autoRefresh : true
    });

    await logAudit(
      req.user._id,
      segment._id,
      'Segment',
      'CREATE_SEGMENT',
      null,
      { name }
    );

    res.status(201).json({ success: true, segment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A segment with this name already exists.' });
    }
    console.error('CRM Create Segment error:', error);
    res.status(500).json({ success: false, message: 'Server error creating segment.' });
  }
};

// @desc    Delete segment
// @route   DELETE /api/crm/segments/:id
const deleteSegment = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({ success: false, message: 'Segment not found.' });
    }

    await Segment.findByIdAndDelete(req.params.id);

    await logAudit(
      req.user._id,
      segment._id,
      'Segment',
      'DELETE_SEGMENT',
      { name: segment.name },
      null
    );

    res.json({ success: true, message: 'Segment deleted successfully.' });
  } catch (error) {
    console.error('CRM Delete Segment error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting segment.' });
  }
};

// @desc    Resolve segment criteria to members list
// @route   GET /api/crm/segments/:id/members
const resolveSegmentMembers = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({ success: false, message: 'Segment not found.' });
    }

    const criteria = segment.filterCriteria;
    const query = { role: 'user', isActive: true };

    // Compile filter criteria into MongoDB User queries
    // 1. Area filter
    if (criteria.area) {
      query['address.area'] = criteria.area;
    }

    // 2. Pincode filter
    if (criteria.pincode) {
      query['address.pincode'] = criteria.pincode;
    }

    // 3. Lifecycle Stage filter
    if (criteria.lifecycleStage) {
      query.lifecycleStage = criteria.lifecycleStage;
    }

    // 4. Tags filter
    if (criteria.tag) {
      query.tags = { $in: [criteria.tag] };
    }

    // 5. Wishlist size filter
    if (criteria.minWishlistSize) {
      query.$expr = {
        $gte: [{ $size: { $ifNull: ['$wishlist', []] } }, Number(criteria.minWishlistSize)]
      };
    }

    // 6. Overdue history filter
    if (criteria.hasOverdueRentals === 'true' || criteria.hasOverdueRentals === true) {
      const overdueRentals = await Rental.find({
        status: 'active',
        dueDate: { $lt: new Date() }
      }).select('user');
      const overdueUserIds = overdueRentals.map(r => r.user);
      query._id = { $in: overdueUserIds };
    }

    // 7. Rented books count filter
    if (criteria.minRentalsCount) {
      // Find users with at least X rentals
      const rentalCounts = await Rental.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $match: { count: { $gte: Number(criteria.minRentalsCount) } } }
      ]);
      const matchedUserIds = rentalCounts.map(r => r._id);
      
      if (query._id) {
        // Intersect with previous overdue ID matches if any
        const existingIds = Array.isArray(query._id.$in) ? query._id.$in.map(id => id.toString()) : [];
        const intersectedIds = matchedUserIds.filter(id => existingIds.includes(id.toString()));
        query._id = { $in: intersectedIds };
      } else {
        query._id = { $in: matchedUserIds };
      }
    }

    const members = await User.find(query).populate('assignedOwner', 'name email');

    // Update segment member count cache
    segment.memberCount = members.length;
    await segment.save();

    res.json({ success: true, count: members.length, members });
  } catch (error) {
    console.error('CRM Resolve Segment error:', error);
    res.status(500).json({ success: false, message: 'Server error compiling segment members.' });
  }
};

module.exports = {
  getSegments,
  createSegment,
  deleteSegment,
  resolveSegmentMembers
};
