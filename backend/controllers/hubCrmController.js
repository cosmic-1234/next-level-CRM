const Hub = require('../models/Hub');
const Rental = require('../models/Rental');
const { logAudit } = require('./contactController');

// @desc    Get all hubs pipeline (CRM perspective)
// @route   GET /api/crm/hubs
const getHubsPipeline = async (req, res) => {
  try {
    const hubs = await Hub.find()
      .populate('hostUser', 'name email phone avatar address')
      .sort({ createdAt: -1 });

    res.json({ success: true, hubs });
  } catch (error) {
    console.error('CRM Get Hubs error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving hub partners.' });
  }
};

// @desc    Update Hub status (Approve/Reject) + agreement notes
// @route   PATCH /api/crm/hubs/:id
const updateHubStatus = async (req, res) => {
  try {
    const { status, agreementNotes } = req.body;
    const hub = await Hub.findById(req.params.id);

    if (!hub) {
      return res.status(404).json({ success: false, message: 'Hub not found.' });
    }

    const beforeValues = {
      status: hub.status,
      agreementNotes: hub.agreementNotes,
      statusHistory: [...hub.statusHistory]
    };

    if (status) {
      hub.status = status;
      hub.statusHistory.push({
        status,
        updatedBy: req.user._id,
        updatedAt: new Date()
      });
    }

    if (agreementNotes !== undefined) {
      hub.agreementNotes = agreementNotes;
    }

    await hub.save();

    const afterValues = {
      status: hub.status,
      agreementNotes: hub.agreementNotes,
      statusHistory: [...hub.statusHistory]
    };

    await logAudit(
      req.user._id,
      hub._id,
      'Hub',
      'UPDATE_HUB_STATUS',
      beforeValues,
      afterValues
    );

    res.json({ success: true, message: 'Hub partner updated successfully.', hub });
  } catch (error) {
    console.error('CRM Update Hub error:', error);
    res.status(500).json({ success: false, message: 'Server error updating hub.' });
  }
};

// @desc    Get detailed hub performance metrics
// @route   GET /api/crm/hubs/:id/performance
const getHubPerformance = async (req, res) => {
  try {
    const hub = await Hub.findById(req.params.id).populate('hostUser', 'name email phone');
    if (!hub) {
      return res.status(404).json({ success: false, message: 'Hub not found.' });
    }

    // Dynamic metrics calculation
    // Count total rentals where deliveryType is 'pickup' and deliveryAddress.area matches the hub's area
    const matchingRentals = await Rental.find({
      deliveryType: 'pickup',
      status: { $in: ['active', 'returned', 'overdue'] }
    }).populate('book', 'title author');

    // We can filter by area
    // Actually, in the models, Rental deliveryAddress.area might match
    const routedRentals = matchingRentals.filter(r => r.deliveryAddress && r.deliveryAddress.area === hub.area);

    const activeRentersCount = new Set(routedRentals.filter(r => r.status === 'active').map(r => r.user.toString())).size;

    // Cache metrics
    hub.performanceStats = {
      rentalsRouted: routedRentals.length,
      activeRenters: activeRentersCount
    };
    await hub.save();

    res.json({
      success: true,
      data: {
        hub,
        metrics: {
          rentalsRoutedCount: routedRentals.length,
          activeRentersCount,
          recentRentals: routedRentals.slice(0, 5)
        }
      }
    });
  } catch (error) {
    console.error('CRM Hub performance error:', error);
    res.status(500).json({ success: false, message: 'Server error compiling hub performance.' });
  }
};

module.exports = {
  getHubsPipeline,
  updateHubStatus,
  getHubPerformance
};
