const express = require('express');
const router = express.Router();
const { exploreSimilar } = require('../controllers/similarity.controller');
const { protect } = require('../middleware/auth');

router.get('/explore', protect, exploreSimilar);

module.exports = router;
