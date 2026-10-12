const Project = require('../models/Project');
const ProjectVersion = require('../models/ProjectVersion');
const Analysis = require('../models/Analysis');
const SimilarityResult = require('../models/SimilarityResult');

// @desc    Get all versions of a project
// @route   GET /api/projects/:id/versions
// @access  Private
const getVersions = async (req, res, next) => {
  try {
    const versions = await ProjectVersion.find({ projectId: req.params.id })
      .populate('createdBy', 'name email role')
      .sort({ versionNumber: -1 });

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new version of a project
// @route   POST /api/projects/:id/versions
// @access  Private (Owner or Admin)
const createVersion = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can create a new version'
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
      references,
      changeSummary
    } = req.body;

    const nextVersionNumber = (project.currentVersion || 1) + 1;

    // Fetch latest analysis and similarity to snapshot
    const [latestAnalysis, latestSimilarity] = await Promise.all([
      Analysis.findOne({ projectId: project._id }).sort({ versionNumber: -1 }),
      SimilarityResult.findOne({ projectId: project._id }).sort({ versionNumber: -1 })
    ]);

    // Update project object
    project.title = title || project.title;
    project.problemStatement = problemStatement || project.problemStatement;
    project.proposedSolution = proposedSolution || project.proposedSolution;
    project.targetUsers = targetUsers || project.targetUsers;
    project.domain = domain || project.domain;
    if (technologies) {
      project.technologies = Array.isArray(technologies) ? technologies : technologies.split(',').map(s => s.trim());
    }
    if (keyFeatures) {
      project.keyFeatures = Array.isArray(keyFeatures) ? keyFeatures : keyFeatures.split(',').map(s => s.trim());
    }
    if (expectedOutcome) project.expectedOutcome = expectedOutcome;
    if (references) {
      project.references = Array.isArray(references) ? references : [references];
    }
    project.currentVersion = nextVersionNumber;
    // If project was under revision_requested, keep it as revision_requested for student resubmission
    if (project.status !== 'revision_requested') {
      project.status = 'draft';
    }
    await project.save();

    // Create version record
    const versionRecord = await ProjectVersion.create({
      projectId: project._id,
      versionNumber: nextVersionNumber,
      title: project.title,
      problemStatement: project.problemStatement,
      proposedSolution: project.proposedSolution,
      targetUsers: project.targetUsers,
      domain: project.domain,
      technologies: project.technologies,
      keyFeatures: project.keyFeatures,
      expectedOutcome: project.expectedOutcome,
      references: project.references,
      changeSummary: changeSummary || `Version ${nextVersionNumber} iteration`,
      createdBy: req.user._id,
      analysisSnapshot: latestAnalysis ? latestAnalysis.toObject() : null,
      similaritySnapshot: latestSimilarity ? latestSimilarity.toObject() : null
    });

    res.status(201).json({
      success: true,
      message: `Version ${nextVersionNumber} created successfully`,
      data: versionRecord,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare two versions of a project
// @route   GET /api/projects/:id/versions/compare
// @access  Private
const compareVersions = async (req, res, next) => {
  try {
    const { v1, v2 } = req.query;

    if (!v1 || !v2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both version numbers to compare (e.g. ?v1=1&v2=2)'
      });
    }

    const [ver1, ver2] = await Promise.all([
      ProjectVersion.findOne({ projectId: req.params.id, versionNumber: parseInt(v1, 10) }),
      ProjectVersion.findOne({ projectId: req.params.id, versionNumber: parseInt(v2, 10) })
    ]);

    if (!ver1 || !ver2) {
      return res.status(404).json({
        success: false,
        message: 'One or both requested versions could not be found'
      });
    }

    // Compute diffs
    const tech1Set = new Set((ver1.technologies || []).map(t => t.toLowerCase()));
    const tech2Set = new Set((ver2.technologies || []).map(t => t.toLowerCase()));

    const addedTechnologies = (ver2.technologies || []).filter(t => !tech1Set.has(t.toLowerCase()));
    const removedTechnologies = (ver1.technologies || []).filter(t => !tech2Set.has(t.toLowerCase()));

    const feat1Set = new Set((ver1.keyFeatures || []).map(f => f.toLowerCase()));
    const feat2Set = new Set((ver2.keyFeatures || []).map(f => f.toLowerCase()));

    const addedFeatures = (ver2.keyFeatures || []).filter(f => !feat1Set.has(f.toLowerCase()));
    const removedFeatures = (ver1.keyFeatures || []).filter(f => !feat2Set.has(f.toLowerCase()));

    const fieldChanges = [];
    if (ver1.title !== ver2.title) fieldChanges.push({ field: 'Title', before: ver1.title, after: ver2.title });
    if (ver1.problemStatement !== ver2.problemStatement)
      fieldChanges.push({ field: 'Problem Statement', before: ver1.problemStatement, after: ver2.problemStatement });
    if (ver1.proposedSolution !== ver2.proposedSolution)
      fieldChanges.push({ field: 'Proposed Solution', before: ver1.proposedSolution, after: ver2.proposedSolution });
    if (ver1.targetUsers !== ver2.targetUsers)
      fieldChanges.push({ field: 'Target Users', before: ver1.targetUsers, after: ver2.targetUsers });
    if (ver1.domain !== ver2.domain)
      fieldChanges.push({ field: 'Domain', before: ver1.domain, after: ver2.domain });
    if (ver1.expectedOutcome !== ver2.expectedOutcome)
      fieldChanges.push({ field: 'Expected Outcome', before: ver1.expectedOutcome, after: ver2.expectedOutcome });

    res.status(200).json({
      success: true,
      data: {
        v1: {
          versionNumber: ver1.versionNumber,
          createdAt: ver1.createdAt,
          changeSummary: ver1.changeSummary,
          data: ver1
        },
        v2: {
          versionNumber: ver2.versionNumber,
          createdAt: ver2.createdAt,
          changeSummary: ver2.changeSummary,
          data: ver2
        },
        diff: {
          addedTechnologies,
          removedTechnologies,
          addedFeatures,
          removedFeatures,
          fieldChanges
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVersions,
  createVersion,
  compareVersions
};
