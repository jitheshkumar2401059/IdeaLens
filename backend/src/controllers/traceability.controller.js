const Requirement = require('../models/Requirement');
const Feature = require('../models/Feature');
const TestCase = require('../models/TestCase');
const Issue = require('../models/Issue');
const Project = require('../models/Project');

// ================= REQUIREMENTS =================
const getRequirements = async (req, res, next) => {
  try {
    const requirements = await Requirement.find({ projectId: req.params.projectId }).sort({ reqCode: 1 });
    res.status(200).json({ success: true, count: requirements.length, data: requirements });
  } catch (error) {
    next(error);
  }
};

const createRequirement = async (req, res, next) => {
  try {
    const { title, description, priority, status } = req.body;
    const { projectId } = req.params;

    // Auto-generate REQ code if not given
    const count = await Requirement.countDocuments({ projectId });
    const reqCode = req.body.reqCode || `REQ-${String(count + 1).padStart(3, '0')}`;

    const requirement = await Requirement.create({
      projectId,
      reqCode,
      title,
      description: description || title,
      priority: priority || 'medium',
      status: status || 'open'
    });

    res.status(201).json({ success: true, data: requirement });
  } catch (error) {
    next(error);
  }
};

const deleteRequirement = async (req, res, next) => {
  try {
    await Requirement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Requirement deleted' });
  } catch (error) {
    next(error);
  }
};

// ================= FEATURES =================
const getFeatures = async (req, res, next) => {
  try {
    const features = await Feature.find({ projectId: req.params.projectId })
      .populate('requirementId', 'reqCode title')
      .sort({ code: 1 });
    res.status(200).json({ success: true, count: features.length, data: features });
  } catch (error) {
    next(error);
  }
};

const createFeature = async (req, res, next) => {
  try {
    const { requirementId, title, description, complexity, status } = req.body;
    const { projectId } = req.params;

    const count = await Feature.countDocuments({ projectId });
    const code = req.body.code || `FEAT-${String(count + 1).padStart(3, '0')}`;

    const feature = await Feature.create({
      projectId,
      requirementId,
      code,
      title,
      description: description || '',
      complexity: complexity || 'medium',
      status: status || 'planned'
    });

    res.status(201).json({ success: true, data: feature });
  } catch (error) {
    next(error);
  }
};

const deleteFeature = async (req, res, next) => {
  try {
    await Feature.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Feature deleted' });
  } catch (error) {
    next(error);
  }
};

// ================= TEST CASES =================
const getTestCases = async (req, res, next) => {
  try {
    const testCases = await TestCase.find({ projectId: req.params.projectId })
      .populate('featureId', 'code title')
      .populate('requirementId', 'reqCode title')
      .sort({ code: 1 });
    res.status(200).json({ success: true, count: testCases.length, data: testCases });
  } catch (error) {
    next(error);
  }
};

const createTestCase = async (req, res, next) => {
  try {
    const { featureId, requirementId, title, description, expectedResult, status } = req.body;
    const { projectId } = req.params;

    const count = await TestCase.countDocuments({ projectId });
    const code = req.body.code || `TC-${String(count + 1).padStart(3, '0')}`;

    const testCase = await TestCase.create({
      projectId,
      featureId,
      requirementId,
      code,
      title,
      description: description || '',
      expectedResult: expectedResult || 'Expects successful validation',
      status: status || 'pending'
    });

    res.status(201).json({ success: true, data: testCase });
  } catch (error) {
    next(error);
  }
};

const deleteTestCase = async (req, res, next) => {
  try {
    await TestCase.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Test Case deleted' });
  } catch (error) {
    next(error);
  }
};

// ================= ISSUES =================
const getIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({ projectId: req.params.projectId })
      .populate('requirementId', 'reqCode title')
      .populate('featureId', 'code title')
      .populate('testCaseId', 'code title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    next(error);
  }
};

const createIssue = async (req, res, next) => {
  try {
    const { requirementId, featureId, testCaseId, title, description, severity, status } = req.body;
    const { projectId } = req.params;

    const count = await Issue.countDocuments({ projectId });
    const code = req.body.code || `ISS-${String(count + 1).padStart(3, '0')}`;

    const issue = await Issue.create({
      projectId,
      requirementId,
      featureId,
      testCaseId,
      code,
      title,
      description,
      severity: severity || 'major',
      status: status || 'open'
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

const deleteIssue = async (req, res, next) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    next(error);
  }
};

// ================= FULL TRACEABILITY MATRIX =================
const getTraceabilityMatrix = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const [requirements, features, testCases, issues] = await Promise.all([
      Requirement.find({ projectId }).lean(),
      Feature.find({ projectId }).lean(),
      TestCase.find({ projectId }).lean(),
      Issue.find({ projectId }).lean()
    ]);

    // Build hierarchical tree
    const matrix = requirements.map(reqItem => {
      const relatedFeatures = features.filter(
        f => f.requirementId && f.requirementId.toString() === reqItem._id.toString()
      );

      const featuresWithChildren = relatedFeatures.map(feat => {
        const relatedTests = testCases.filter(
          tc => tc.featureId && tc.featureId.toString() === feat._id.toString()
        );
        const relatedIssues = issues.filter(
          iss => iss.featureId && iss.featureId.toString() === feat._id.toString()
        );

        return {
          ...feat,
          testCases: relatedTests,
          issues: relatedIssues
        };
      });

      return {
        ...reqItem,
        features: featuresWithChildren,
        orphanIssues: issues.filter(
          iss =>
            iss.requirementId &&
            iss.requirementId.toString() === reqItem._id.toString() &&
            !iss.featureId
        )
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          requirementsCount: requirements.length,
          featuresCount: features.length,
          testCasesCount: testCases.length,
          issuesCount: issues.length
        },
        matrix
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
