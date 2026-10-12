const User = require('../models/User');
const Project = require('../models/Project');
const Review = require('../models/Review');
const Analysis = require('../models/Analysis');

// @desc    Get dashboard metrics based on authenticated user's role
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'student') {
      const [
        totalProjects,
        draft,
        submitted,
        underReview,
        resubmitted,
        revisionRequested,
        approved,
        rejected
      ] = await Promise.all([
        Project.countDocuments({ studentId: userId, isArchived: false }),
        Project.countDocuments({ studentId: userId, isArchived: false, status: 'draft' }),
        Project.countDocuments({ studentId: userId, isArchived: false, status: 'submitted' }),
        Project.countDocuments({ studentId: userId, isArchived: false, status: 'under_review' }),
        Project.countDocuments({ studentId: userId, isArchived: false, status: 'resubmitted' }),
        Project.countDocuments({ studentId: userId, isArchived: false, status: 'revision_requested' }),
        Project.countDocuments({ studentId: userId, isArchived: false, status: 'approved' }),
        Project.countDocuments({ studentId: userId, isArchived: false, status: 'rejected' })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalProjects,
          draft,
          submitted: submitted + resubmitted,
          underReview,
          revisionRequested,
          approved,
          rejected
        }
      });
    }

    if (role === 'faculty') {
      const [
        totalSubmissions,
        pendingReview,
        approved,
        revisionRequested,
        rejected,
        myReviewsCount
      ] = await Promise.all([
        Project.countDocuments({ isArchived: false }),
        Project.countDocuments({ isArchived: false, status: { $in: ['submitted', 'resubmitted', 'under_review'] } }),
        Project.countDocuments({ isArchived: false, status: 'approved' }),
        Project.countDocuments({ isArchived: false, status: 'revision_requested' }),
        Project.countDocuments({ isArchived: false, status: 'rejected' }),
        Review.countDocuments({ facultyId: userId })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalSubmissions,
          pendingReview,
          approved,
          revisionRequested,
          rejected,
          myReviewsCount
        }
      });
    }

    if (role === 'admin') {
      const [
        totalUsers,
        totalStudents,
        totalFaculty,
        totalProjects,
        draft,
        submitted,
        underReview,
        approved,
        revisionRequested,
        rejected,
        totalAnalyzed
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        Project.countDocuments({ isArchived: false }),
        Project.countDocuments({ isArchived: false, status: 'draft' }),
        Project.countDocuments({ isArchived: false, status: { $in: ['submitted', 'resubmitted'] } }),
        Project.countDocuments({ isArchived: false, status: 'under_review' }),
        Project.countDocuments({ isArchived: false, status: 'approved' }),
        Project.countDocuments({ isArchived: false, status: 'revision_requested' }),
        Project.countDocuments({ isArchived: false, status: 'rejected' }),
        Analysis.countDocuments()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            students: totalStudents,
            faculty: totalFaculty
          },
          projects: {
            total: totalProjects,
            draft,
            submitted,
            underReview,
            approved,
            revisionRequested,
            rejected,
            totalAnalyzed
          }
        }
      });
    }

    res.status(400).json({ success: false, message: 'Invalid role' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for logged-in student (legacy/alias)
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [
      totalProjects,
      draftProjects,
      submittedProjects,
      underReviewProjects,
      resubmittedProjects,
      approvedProjects,
      revisionProjects
    ] = await Promise.all([
      Project.countDocuments({ studentId, isArchived: false }),
      Project.countDocuments({ studentId, isArchived: false, status: 'draft' }),
      Project.countDocuments({ studentId, isArchived: false, status: 'submitted' }),
      Project.countDocuments({ studentId, isArchived: false, status: 'under_review' }),
      Project.countDocuments({ studentId, isArchived: false, status: 'resubmitted' }),
      Project.countDocuments({ studentId, isArchived: false, status: 'approved' }),
      Project.countDocuments({ studentId, isArchived: false, status: 'revision_requested' })
    ]);

    const combinedSubmittedReview = submittedProjects + underReviewProjects + resubmittedProjects;

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        draftProjects,
        submittedProjects: combinedSubmittedReview,
        approvedProjects,
        revisionProjects
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for faculty (legacy/alias)
// @route   GET /api/dashboard/faculty
// @access  Private (Faculty, Admin)
const getFacultyDashboardStats = async (req, res, next) => {
  try {
    const [
      totalSubmissions,
      pendingReview,
      approvedProjects,
      revisionProjects
    ] = await Promise.all([
      Project.countDocuments({ isArchived: false }),
      Project.countDocuments({ isArchived: false, status: { $in: ['submitted', 'resubmitted', 'under_review'] } }),
      Project.countDocuments({ isArchived: false, status: 'approved' }),
      Project.countDocuments({ isArchived: false, status: 'revision_requested' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        pendingReview,
        approvedProjects,
        revisionProjects
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStudentDashboardStats,
  getFacultyDashboardStats
};

