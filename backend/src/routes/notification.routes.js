const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.get('/', protect, getMyNotifications);
router.patch('/:id/read', protect, validateObjectId('id'), markAsRead);
router.post('/read-all', protect, markAllAsRead);

module.exports = router;
