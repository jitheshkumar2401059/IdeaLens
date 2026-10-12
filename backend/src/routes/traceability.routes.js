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

// Direct item deletion routes (literal segments first)
router.delete('/requirements/:id', protect, validateObjectId('id'), deleteRequirement);
router.delete('/features/:id', protect, validateObjectId('id'), deleteFeature);
router.delete('/testcases/:id', protect, validateObjectId('id'), deleteTestCase);
router.delete('/issues/:id', protect, validateObjectId('id'), deleteIssue);

// Scoped deletion routes with projectId
router.delete('/:projectId/requirements/:id', protect, validateObjectId('id'), deleteRequirement);
router.delete('/:projectId/features/:id', protect, validateObjectId('id'), deleteFeature);
router.delete('/:projectId/testcases/:id', protect, validateObjectId('id'), deleteTestCase);
router.delete('/:projectId/issues/:id', protect, validateObjectId('id'), deleteIssue);

// Traceability Tree Matrix
router.get('/:projectId/traceability-matrix', protect, validateObjectId('projectId'), getTraceabilityMatrix);

// Requirements
router.get('/:projectId/requirements', protect, validateObjectId('projectId'), getRequirements);
router.post('/:projectId/requirements', protect, validateObjectId('projectId'), createRequirement);

// Features
router.get('/:projectId/features', protect, validateObjectId('projectId'), getFeatures);
router.post('/:projectId/features', protect, validateObjectId('projectId'), createFeature);

// Test Cases
router.get('/:projectId/testcases', protect, validateObjectId('projectId'), getTestCases);
router.post('/:projectId/testcases', protect, validateObjectId('projectId'), createTestCase);

// Issues
router.get('/:projectId/issues', protect, validateObjectId('projectId'), getIssues);
router.post('/:projectId/issues', protect, validateObjectId('projectId'), createIssue);

module.exports = router;
