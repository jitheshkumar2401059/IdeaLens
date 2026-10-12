const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStudentDashboardStats,
  getFacultyDashboardStats
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/stats', protect, getDashboardStats);
router.get('/student', protect, getStudentDashboardStats);
router.get('/faculty', protect, authorize('faculty', 'admin'), getFacultyDashboardStats);

module.exports = router;
