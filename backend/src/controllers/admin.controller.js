const User = require('../models/User');
const Project = require('../models/Project');
const Analysis = require('../models/Analysis');
const Review = require('../models/Review');
const Domain = require('../models/Domain');

// @desc    Get all users with search and filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status !== undefined && status !== '') filter.isActive = status === 'true';

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrator cannot deactivate their own active account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live platform aggregate statistics
// @route   GET /api/admin/stats
// @access  Private
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentCount,
      facultyCount,
      totalProjects,
      draftProjects,
      submittedProjects,
      underReviewProjects,
      approvedProjects,
      revisionProjects,
      analyzedCount,
      domainStatsRaw,
      recentProjects,
      recentReviews
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Project.countDocuments({ isArchived: false }),
      Project.countDocuments({ isArchived: false, status: 'draft' }),
      Project.countDocuments({ isArchived: false, status: 'submitted' }),
      Project.countDocuments({ isArchived: false, status: 'under_review' }),
      Project.countDocuments({ isArchived: false, status: 'approved' }),
      Project.countDocuments({ isArchived: false, status: 'revision_requested' }),
      Analysis.countDocuments(),
      Project.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: '$domain', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Project.find({ isArchived: false })
        .populate('studentId', 'name email department')
        .sort({ createdAt: -1 })
        .limit(6),
      Review.find()
        .populate('projectId', 'title domain')
        .populate('facultyId', 'name department')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: studentCount,
          faculty: facultyCount
        },
        projects: {
          total: totalProjects,
          draft: draftProjects,
          submitted: submittedProjects,
          underReview: underReviewProjects,
          approved: approvedProjects,
          revisionRequested: revisionProjects,
          totalAnalyzed: analyzedCount
        },
        domainBreakdown: domainStatsRaw.map(d => ({
          domain: d._id || 'Unassigned',
          count: d.count
        })),
        recentActivity: {
          projects: recentProjects,
          reviews: recentReviews
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  toggleUserStatus,
  getPlatformStats
};
