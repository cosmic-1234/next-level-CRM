const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Import Controllers
const { getDashboardStats } = require('../controllers/dashboardController');
const {
  getContacts,
  getContactDetails,
  updateContact,
  addContactNote,
  deleteContactNote,
  addContactInteraction
} = require('../controllers/contactController');
const {
  getTickets,
  createTicket,
  getTicketDetails,
  addTicketMessage,
  updateTicket
} = require('../controllers/ticketController');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const {
  getSegments,
  createSegment,
  deleteSegment,
  resolveSegmentMembers
} = require('../controllers/segmentController');
const {
  getCampaigns,
  createCampaign,
  sendCampaign
} = require('../controllers/campaignController');
const { getHubsPipeline, updateHubStatus, getHubPerformance } = require('../controllers/hubCrmController');
const { getAuditLogs } = require('../controllers/auditController');
const { getRentals } = require('../controllers/rentalController');

// All CRM routes require authentication and admin access
router.use(protect, adminAuth);

// 1. Dashboard
router.get('/dashboard', getDashboardStats);

// 2. Contacts
router.get('/contacts', getContacts);
router.get('/contacts/:id', getContactDetails);
router.patch('/contacts/:id', updateContact);
router.post('/contacts/:id/notes', addContactNote);
router.delete('/notes/:noteId', deleteContactNote);
router.post('/contacts/:id/interactions', addContactInteraction);

// 3. Ticketing
router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.get('/tickets/:id', getTicketDetails);
router.post('/tickets/:id/messages', addTicketMessage);
router.patch('/tickets/:id', updateTicket);

// 4. Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// 5. Segmentation
router.get('/segments', getSegments);
router.post('/segments', createSegment);
router.delete('/segments/:id', deleteSegment);
router.get('/segments/:id/members', resolveSegmentMembers);

// 6. Campaigns
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.post('/campaigns/:id/send', sendCampaign);

// 7. Hub Partners
router.get('/hubs', getHubsPipeline);
router.patch('/hubs/:id', updateHubStatus);
router.get('/hubs/:id/performance', getHubPerformance);

// 8. Audit logs
router.get('/audit-log', getAuditLogs);

// 9. Rentals/Orders
router.get('/rentals', getRentals);

module.exports = router;
