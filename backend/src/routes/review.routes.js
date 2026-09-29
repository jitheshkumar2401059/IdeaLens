const express = require('express');
const router = express.Router();
const { getAllReviews } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('faculty', 'admin'), getAllReviews);

module.exports = router;
