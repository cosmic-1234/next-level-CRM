const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs (Super Admin)
// @route   GET /api/crm/audit-log
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100); // Caps it to the last 100 entries

    res.json({ success: true, logs });
  } catch (error) {
    console.error('CRM Get Audit Logs error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving audit trails.' });
  }
};

module.exports = { getAuditLogs };
