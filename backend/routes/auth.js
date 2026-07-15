const express = require('express');
const router = express.Router();
const { loginCrm, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginCrm);
router.get('/me', protect, getMe);

module.exports = router;
