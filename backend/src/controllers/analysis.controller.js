const Project = require('../models/Project');
const Analysis = require('../models/Analysis');
const SimilarityResult = require('../models/SimilarityResult');
const geminiService = require('../services/gemini.service');
const similarityService = require('../services/similarity.service');

// @desc    Trigger AI and similarity analysis for a project
// @route   POST /api/projects/:id/analyze
// @access  Private
const analyzeProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.isArchived) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const versionNumber = project.currentVersion || 1;

    // Run AI analysis and Similarity analysis
    const [aiAnalysis, similarityResult] = await Promise.all([
      geminiService.analyzeProject(project, versionNumber),
      similarityService.analyzeSimilarity(project, versionNumber)
    ]);

    // Update Project timestamp
    project.lastAnalyzedAt = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Idea analysis completed successfully',
      data: {
        analysis: aiAnalysis,
        similarity: similarityResult
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI analysis for a project
// @route   GET /api/projects/:id/analysis
// @access  Private
const getProjectAnalysis = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.isArchived) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const versionNumber = req.query.version ? parseInt(req.query.version, 10) : undefined;
    const filter = { projectId: req.params.id };
    if (versionNumber) {
      filter.versionNumber = versionNumber;
    }

    const analysis = await Analysis.findOne(filter).sort({ versionNumber: -1, createdAt: -1 });

    if (!analysis) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No AI analysis found for this project yet. Click "Analyze Idea" to generate.'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeProject,
  getProjectAnalysis
};
