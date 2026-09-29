const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, getPlatformStats } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateObjectId } = require('../middleware/validate');

// Platform stats can be viewed by authenticated users for dashboards
router.get('/stats', protect, getPlatformStats);

// Admin exclusive user management
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/toggle-status', protect, authorize('admin'), validateObjectId('id'), toggleUserStatus);

module.exports = router;
