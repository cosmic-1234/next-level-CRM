const User = require('../models/User');
const Rental = require('../models/Rental');
const SupportTicket = require('../models/SupportTicket');
const Task = require('../models/Task');
const Hub = require('../models/Hub');

// @desc    Get CRM Dashboard stats
// @route   GET /api/crm/dashboard
const getDashboardStats = async (req, res) => {
  try {
    // 1. Member Lifecycle Funnel Count
    const [leads, active, atRisk, churned, vip] = await Promise.all([
      User.countDocuments({ role: 'user', lifecycleStage: 'lead', isActive: true }),
      User.countDocuments({ role: 'user', lifecycleStage: 'active', isActive: true }),
      User.countDocuments({ role: 'user', lifecycleStage: 'at-risk', isActive: true }),
      User.countDocuments({ role: 'user', lifecycleStage: 'churned', isActive: true }),
      User.countDocuments({ role: 'user', lifecycleStage: 'vip', isActive: true })
    ]);

    // 2. Support Tickets Count
    const [openTickets, inProgressTickets, resolvedTickets, closedTickets] = await Promise.all([
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'in-progress' }),
      SupportTicket.countDocuments({ status: 'resolved' }),
      SupportTicket.countDocuments({ status: 'closed' })
    ]);

    // 3. Task Status Count
    const [todoTasks, inProgressTasks, doneTasks] = await Promise.all([
      Task.countDocuments({ status: 'todo' }),
      Task.countDocuments({ status: 'in-progress' }),
      Task.countDocuments({ status: 'done' })
    ]);

    // 4. Overdue Rentals Count
    const overdueCount = await Rental.countDocuments({
      status: 'active',
      dueDate: { $lt: new Date() }
    });

    // 5. Hub Performance (Top Hubs based on routed rentals)
    const hubs = await Hub.find()
      .populate('hostUser', 'name')
      .sort({ 'performanceStats.rentalsRouted': -1 })
      .limit(5);

    // 6. Support Tickets breakdown by category
    const ticketCategories = await SupportTicket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // 7. Month-over-month rentals and revenue logs (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await Rental.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          rentalsCount: { $sum: 1 },
          revenue: { $sum: '$totalCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        lifecycleFunnel: { leads, active, atRisk, churned, vip },
        supportTickets: { open: openTickets, inProgress: inProgressTickets, resolved: resolvedTickets, closed: closedTickets },
        tasks: { todo: todoTasks, inProgress: inProgressTasks, done: doneTasks },
        overdueCount,
        hubs,
        ticketCategories,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('CRM Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving CRM dashboard stats.' });
  }
};

module.exports = { getDashboardStats };
