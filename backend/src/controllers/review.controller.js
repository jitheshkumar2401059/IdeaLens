const Review = require('../models/Review');
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Get all reviews and comments for a project
// @route   GET /api/projects/:id/reviews
// @access  Private
const getReviewsForProject = async (req, res, next) => {
  try {
    const reviews = await Review.find({ projectId: req.params.id })
      .populate('facultyId', 'name email department')
      .sort({ createdAt: -1 });

    const comments = await Comment.find({ projectId: req.params.id })
      .populate('authorId', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty review and update project status
// @route   POST /api/projects/:id/reviews
// @access  Private (Faculty or Admin)
const createReview = async (req, res, next) => {
  try {
    const { statusDecision, comments, criteriaRatings } = req.body;

    if (!statusDecision || !comments) {
      return res.status(400).json({
        success: false,
        message: 'Status decision and review comments are required'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const review = await Review.create({
      projectId: project._id,
      facultyId: req.user._id,
      versionNumber: project.currentVersion || 1,
      statusDecision,
      comments,
      criteriaRatings: criteriaRatings || {
        problemClarity: 4,
        innovationNovelty: 4,
        technicalFeasibility: 4,
        societalImpact: 4
      }
    });

    // Update project status according to decision
    project.status = statusDecision;
    await project.save();

    // Create notification for student
    const decisionText =
      statusDecision === 'approved'
        ? 'Approved! 🎉'
        : statusDecision === 'revision_requested'
        ? 'Revision Requested'
        : statusDecision === 'rejected'
        ? 'Decision: Needs Substantial Rethink'
        : 'Under Active Review';

    await Notification.create({
      recipientId: project.studentId,
      senderId: req.user._id,
      projectId: project._id,
      type: 'review_added',
      title: `Project Review: ${decisionText}`,
      message: `Faculty reviewer ${req.user.name} reviewed "${project.title}": ${comments.substring(0, 100)}...`,
      link: `/projects/${project._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Review recorded and project status updated successfully',
      data: review,
      projectStatus: project.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add discussion comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const comment = await Comment.create({
      projectId: project._id,
      authorId: req.user._id,
      authorRole: req.user.role,
      content: content.trim()
    });

    // Notify student if faculty commented, or faculty if student commented
    if (req.user.role === 'faculty') {
      await Notification.create({
        recipientId: project.studentId,
        senderId: req.user._id,
        projectId: project._id,
        type: 'comment_added',
        title: 'New Review Comment',
        message: `Faculty ${req.user.name} left a comment on "${project.title}"`,
        link: `/projects/${project._id}`
      });
    }

    const populated = await Comment.findById(comment._id).populate('authorId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews platform-wide (Faculty / Admin view)
// @route   GET /api/reviews
// @access  Private (Faculty or Admin)
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('projectId', 'title domain status studentId')
      .populate('facultyId', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewsForProject,
  createReview,
  addComment,
  getAllReviews
};
