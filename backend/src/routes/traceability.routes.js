const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getRequirements,
  createRequirement,
  deleteRequirement,
  getFeatures,
  createFeature,
  deleteFeature,
  getTestCases,
  createTestCase,
  deleteTestCase,
  getIssues,
  createIssue,
  deleteIssue,
  getTraceabilityMatrix
} = require('../controllers/traceability.controller');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

// Traceability Tree Matrix
router.get('/:projectId/traceability-matrix', protect, validateObjectId('projectId'), getTraceabilityMatrix);

// Requirements
router.get('/:projectId/requirements', protect, validateObjectId('projectId'), getRequirements);
router.post('/:projectId/requirements', protect, validateObjectId('projectId'), createRequirement);
router.delete('/requirements/:id', protect, validateObjectId('id'), deleteRequirement);

// Features
router.get('/:projectId/features', protect, validateObjectId('projectId'), getFeatures);
router.post('/:projectId/features', protect, validateObjectId('projectId'), createFeature);
router.delete('/features/:id', protect, validateObjectId('id'), deleteFeature);

// Test Cases
router.get('/:projectId/testcases', protect, validateObjectId('projectId'), getTestCases);
router.post('/:projectId/testcases', protect, validateObjectId('projectId'), createTestCase);
router.delete('/testcases/:id', protect, validateObjectId('id'), deleteTestCase);

// Issues
router.get('/:projectId/issues', protect, validateObjectId('projectId'), getIssues);
router.post('/:projectId/issues', protect, validateObjectId('projectId'), createIssue);
router.delete('/issues/:id', protect, validateObjectId('id'), deleteIssue);

module.exports = router;
