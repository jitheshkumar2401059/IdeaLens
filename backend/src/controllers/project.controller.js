const Project = require('../models/Project');
const ProjectVersion = require('../models/ProjectVersion');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all projects with filters and search
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { domain, status, search, mine, sort } = req.query;
    const filter = { isArchived: false };

    // Student can see all or only their own if mine=true
    if (req.user.role === 'student') {
      if (mine === 'true' || mine === true) {
        filter.studentId = req.user._id;
      }
    }

    if (domain) {
      filter.domain = domain;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problemStatement: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Project.find(filter).populate('studentId', 'name email department');

    if (sort === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else if (sort === 'title') {
      query = query.sort({ title: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const projects = await query.exec();

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('studentId', 'name email department');
    if (!project || project.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Students)
const createProject = async (req, res, next) => {
  try {
    let {
      title,
      description,
      problemStatement,
      proposedSolution,
      targetUsers,
      domain,
      technologies,
      keyFeatures,
      expectedOutcome,
      references
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a project title'
      });
    }

    if (!domain) {
      domain = 'AI / Data Science';
    }

    if (!problemStatement) {
      problemStatement = description || 'Automated incident monitoring and safety pattern identification for academic campus environments.';
    }

    if (!proposedSolution) {
      proposedSolution = description || 'An AI-assisted platform for monitoring safety incidents, identifying risk patterns, and providing decision-support insights.';
    }

    if (!targetUsers) {
      targetUsers = 'Campus security personnel, students, faculty, and administrative staff';
    }

    let parsedTech = [];
    if (Array.isArray(technologies) && technologies.length > 0) {
      parsedTech = technologies;
    } else if (typeof technologies === 'string' && technologies.trim()) {
      parsedTech = technologies.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (parsedTech.length === 0) {
      parsedTech = ['Node.js', 'Express', 'Angular', 'MongoDB', 'Python'];
    }

    let parsedFeatures = [];
    if (Array.isArray(keyFeatures) && keyFeatures.length > 0) {
      parsedFeatures = keyFeatures;
    } else if (typeof keyFeatures === 'string' && keyFeatures.trim()) {
      parsedFeatures = keyFeatures.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (parsedFeatures.length === 0) {
      parsedFeatures = ['Real-time Incident Detection', 'Pattern Analysis Engine', 'Alert & Action Notification Matrix'];
    }

    const outcome = expectedOutcome || 'A fully operational production-grade system meeting all specified evaluation rubrics';

    let parsedReferences = [];
    if (Array.isArray(references)) {
      parsedReferences = references;
    } else if (typeof references === 'string' && references.trim()) {
      parsedReferences = [references.trim()];
    }

    const project = await Project.create({
      title,
      problemStatement,
      proposedSolution,
      targetUsers,
      domain,
      technologies: parsedTech,
      keyFeatures: parsedFeatures,
      expectedOutcome: outcome,
      references: parsedReferences,
      studentId: req.user._id,
      status: 'draft',
      currentVersion: 1
    });

    // Create initial ProjectVersion 1
    await ProjectVersion.create({
      projectId: project._id,
      versionNumber: 1,
      title: project.title,
      problemStatement: project.problemStatement,
      proposedSolution: project.proposedSolution,
      targetUsers: project.targetUsers,
      domain: project.domain,
      technologies: project.technologies,
      keyFeatures: project.keyFeatures,
      expectedOutcome: project.expectedOutcome,
      references: project.references,
      changeSummary: 'Initial version created by student',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner or Admin)
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check ownership
    if (project.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }

    const {
      title,
      problemStatement,
      proposedSolution,
      targetUsers,
      domain,
      technologies,
      keyFeatures,
      expectedOutcome,
      references
    } = req.body;

    if (title) project.title = title;
    if (problemStatement) project.problemStatement = problemStatement;
    if (proposedSolution) project.proposedSolution = proposedSolution;
    if (targetUsers) project.targetUsers = targetUsers;
    if (domain) project.domain = domain;
    if (technologies) project.technologies = Array.isArray(technologies) ? technologies : technologies.split(',').map(s => s.trim());
    if (keyFeatures) project.keyFeatures = Array.isArray(keyFeatures) ? keyFeatures : keyFeatures.split(',').map(s => s.trim());
    if (expectedOutcome) project.expectedOutcome = expectedOutcome;
    if (references) project.references = Array.isArray(references) ? references : [references];

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    project.isArchived = true;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit project for faculty review
// @route   POST /api/projects/:id/submit
// @access  Private (Student owner)
const submitProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can submit this project for review'
      });
    }

    if (project.status !== 'draft' && project.status !== 'revision_requested') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit project in '${project.status}' status. Only projects in 'draft' or 'revision_requested' can be submitted.`
      });
    }

    const nextStatus = project.status === 'revision_requested' ? 'resubmitted' : 'submitted';
    project.status = nextStatus;
    await project.save();

    // Notify all faculty members
    const facultyUsers = await User.find({ role: 'faculty', isActive: true });
    for (const faculty of facultyUsers) {
      await Notification.create({
        recipientId: faculty._id,
        senderId: req.user._id,
        projectId: project._id,
        type: 'project_submitted',
        title: `Project ${nextStatus === 'resubmitted' ? 'Resubmitted' : 'Submitted'} for Review`,
        message: `${req.user.name} has submitted "${project.title}" in domain ${project.domain} for faculty review.`,
        link: `/projects/${project._id}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Project ${nextStatus} successfully for faculty review`,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  submitProject
};
