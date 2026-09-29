const express = require('express');
const router = express.Router();
const { getDomains, createDomain } = require('../controllers/domain.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getDomains);
router.post('/', protect, authorize('admin'), createDomain);

module.exports = router;
