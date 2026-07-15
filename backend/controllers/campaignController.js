const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const { resolveSegmentMembers } = require('./segmentController');
const { logAudit } = require('./contactController');

// @desc    List campaigns
// @route   GET /api/crm/campaigns
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('targetSegment', 'name').sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('CRM Get Campaigns error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving campaigns.' });
  }
};

// @desc    Create/Schedule Campaign
// @route   POST /api/crm/campaigns
const createCampaign = async (req, res) => {
  try {
    const { name, channel, targetSegmentId, templateSubject, templateBody, scheduledDate } = req.body;

    if (!name || !channel || !targetSegmentId || !templateBody) {
      return res.status(400).json({ success: false, message: 'Name, channel, target segment, and body template are required.' });
    }

    const campaign = await Campaign.create({
      name,
      channel,
      targetSegment: targetSegmentId,
      template: {
        subject: templateSubject || '',
        body: templateBody
      },
      status: scheduledDate ? 'scheduled' : 'draft',
      scheduledDate: scheduledDate || null
    });

    await logAudit(
      req.user._id,
      campaign._id,
      'Campaign',
      'CREATE_CAMPAIGN',
      null,
      { name, channel }
    );

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    console.error('CRM Create Campaign error:', error);
    res.status(500).json({ success: false, message: 'Server error creating campaign.' });
  }
};

// @desc    Trigger/Send Campaign manually
// @route   POST /api/crm/campaigns/:id/send
const sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ success: false, message: 'This campaign has already been sent.' });
    }

    // Resolve target segment members
    const segment = await Segment.findById(campaign.targetSegment);
    if (!segment) {
      return res.status(404).json({ success: false, message: 'Target segment not found.' });
    }

    // Reuse the same resolution logic as the segmentController (but directly in backend)
    // We will call a helper function or fetch the users
    // Let's copy query compiling from resolveSegmentMembers to avoid making an HTTP call
    const criteria = segment.filterCriteria;
    const query = { role: 'user', isActive: true };

    if (criteria.area) query['address.area'] = criteria.area;
    if (criteria.pincode) query['address.pincode'] = criteria.pincode;
    if (criteria.lifecycleStage) query.lifecycleStage = criteria.lifecycleStage;
    if (criteria.tag) query.tags = { $in: [criteria.tag] };
    if (criteria.minWishlistSize) {
      query.$expr = { $gte: [{ $size: { $ifNull: ['$wishlist', []] } }, Number(criteria.minWishlistSize)] };
    }

    const members = await User.find(query);

    if (members.length === 0) {
      return res.status(400).json({ success: false, message: 'Target segment has 0 members. Cannot send campaign.' });
    }

    // Send mock messages & log outbound interaction for each member
    const interactionLogs = [];
    const templateBody = campaign.template.body;
    const subject = campaign.template.subject;

    for (const member of members) {
      // Dynamic merge fields replace
      let personalBody = templateBody
        .replace(/{{name}}/g, member.name)
        .replace(/{{email}}/g, member.email)
        .replace(/{{phone}}/g, member.phone || '');

      // Create interaction log
      interactionLogs.push({
        type: campaign.channel === 'email' ? 'email' : 'WhatsApp',
        channel: campaign.channel,
        direction: 'out',
        user: member._id,
        admin: req.user._id,
        summary: `Outbound Campaign: "${campaign.name}"\nSubject: ${subject}\nBody: ${personalBody.substring(0, 300)}...`
      });
    }

    // Bulk write interaction logs
    await Interaction.insertMany(interactionLogs);

    // Update campaign metrics
    campaign.status = 'sent';
    campaign.sentDate = new Date();
    campaign.stats = {
      sent: members.length,
      opened: Math.ceil(members.length * (campaign.channel === 'email' ? 0.35 : 0.85)), // simulate higher open rate on WhatsApp
      clicked: Math.ceil(members.length * (campaign.channel === 'email' ? 0.12 : 0.45)), // simulate click metrics
      converted: Math.ceil(members.length * 0.05) // simulate conversion
    };

    await campaign.save();

    await logAudit(
      req.user._id,
      campaign._id,
      'Campaign',
      'SEND_CAMPAIGN',
      { status: 'draft' },
      { status: 'sent', stats: campaign.stats }
    );

    res.json({
      success: true,
      message: `Campaign sent successfully to ${members.length} members.`,
      campaign
    });
  } catch (error) {
    console.error('CRM Send Campaign error:', error);
    res.status(500).json({ success: false, message: 'Server error sending campaign.' });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  sendCampaign
};
