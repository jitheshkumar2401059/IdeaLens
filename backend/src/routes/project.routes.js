const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  submitProject
} = require('../controllers/project.controller');
const { analyzeProject, getProjectAnalysis } = require('../controllers/analysis.controller');
const { getSimilarForProject } = require('../controllers/similarity.controller');
const { getVersions, createVersion, compareVersions } = require('../controllers/version.controller');
const { getReviewsForProject, createReview, addComment } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateObjectId } = require('../middleware/validate');

// Base project CRUD
router.get('/', protect, getProjects);
router.post('/', protect, createProject);
router.get('/:id', protect, validateObjectId('id'), getProjectById);
router.put('/:id', protect, validateObjectId('id'), updateProject);
router.delete('/:id', protect, validateObjectId('id'), deleteProject);

// Submission for review
router.post('/:id/submit', protect, validateObjectId('id'), submitProject);

// AI & Similarity Analysis
router.post('/:id/analyze', protect, validateObjectId('id'), analyzeProject);
router.get('/:id/analysis', protect, validateObjectId('id'), getProjectAnalysis);
router.get('/:id/similar', protect, validateObjectId('id'), getSimilarForProject);

// Versioning
router.get('/:id/versions', protect, validateObjectId('id'), getVersions);
router.post('/:id/versions', protect, validateObjectId('id'), createVersion);
router.get('/:id/versions/compare', protect, validateObjectId('id'), compareVersions);

// Reviews & Feedback
router.get('/:id/reviews', protect, validateObjectId('id'), getReviewsForProject);
router.post('/:id/reviews', protect, authorize('faculty', 'admin'), validateObjectId('id'), createReview);
router.post('/:id/comments', protect, validateObjectId('id'), addComment);

module.exports = router;
