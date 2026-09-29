const Project = require('../models/Project');
const SimilarityResult = require('../models/SimilarityResult');
const similarityService = require('../services/similarity.service');

// @desc    Get similarity results for a specific project
// @route   GET /api/projects/:id/similar
// @access  Private
const getSimilarForProject = async (req, res, next) => {
  try {
    const versionNumber = req.query.version ? parseInt(req.query.version, 10) : undefined;
    const filter = { projectId: req.params.id };
    if (versionNumber) {
      filter.versionNumber = versionNumber;
    }

    let similarity = await SimilarityResult.findOne(filter).sort({ versionNumber: -1, createdAt: -1 });

    if (!similarity) {
      // Automatically compute if not already computed
      const project = await Project.findById(req.params.id);
      if (project) {
        similarity = await similarityService.analyzeSimilarity(project, project.currentVersion || 1);
      }
    }

    if (!similarity) {
      return res.status(404).json({
        success: false,
        message: 'No similarity analysis available for this project'
      });
    }

    res.status(200).json({
      success: true,
      data: similarity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Global similarity explorer across the platform
// @route   GET /api/similarity/explore
// @access  Private
const exploreSimilar = async (req, res, next) => {
  try {
    const { query, domain, technology, sort } = req.query;

    const filter = { isArchived: false };

    if (domain) {
      filter.domain = domain;
    }

    if (technology) {
      filter.technologies = { $regex: technology, $options: 'i' };
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { problemStatement: { $regex: query, $options: 'i' } },
        { proposedSolution: { $regex: query, $options: 'i' } },
        { technologies: { $regex: query, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('studentId', 'name department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSimilarForProject,
  exploreSimilar
};
