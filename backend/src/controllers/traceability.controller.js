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
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    const features = await Feature.find({ requirementId: requirement._id });
    const featureIds = features.map(f => f._id);

    // Cascade delete downstream items
    await Issue.deleteMany({
      $or: [
        { requirementId: requirement._id },
        { featureId: { $in: featureIds } }
      ]
    });

    await TestCase.deleteMany({
      $or: [
        { requirementId: requirement._id },
        { featureId: { $in: featureIds } }
      ]
    });

    await Feature.deleteMany({ requirementId: requirement._id });
    await Requirement.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Requirement and associated artifacts deleted' });
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

    if (!requirementId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Requirement ID and feature title are required'
      });
    }

    const requirement = await Requirement.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Referenced Requirement not found' });
    }

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

    const populated = await Feature.findById(feature._id).populate('requirementId', 'reqCode title');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }

    await Issue.deleteMany({ featureId: feature._id });
    await TestCase.deleteMany({ featureId: feature._id });
    await Feature.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Feature and associated test cases/issues deleted' });
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
    const { featureId, title, description, expectedResult, status } = req.body;
    const { projectId } = req.params;

    if (!featureId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Feature ID and test case title are required'
      });
    }

    const feature = await Feature.findById(featureId);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Referenced Feature not found' });
    }

    const requirementId = req.body.requirementId || feature.requirementId;
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

    const populated = await TestCase.findById(testCase._id)
      .populate('featureId', 'code title')
      .populate('requirementId', 'reqCode title');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ success: false, message: 'Test Case not found' });
    }

    await Issue.deleteMany({ testCaseId: testCase._id });
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
    const { title, description, severity, status } = req.body;
    let { requirementId, featureId, testCaseId } = req.body;
    const { projectId } = req.params;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Issue title is required'
      });
    }

    // Auto-infer parent links if testCaseId is provided
    if (testCaseId) {
      const tc = await TestCase.findById(testCaseId);
      if (tc) {
        if (!featureId) featureId = tc.featureId;
        if (!requirementId) requirementId = tc.requirementId;
      }
    } else if (featureId) {
      const feat = await Feature.findById(featureId);
      if (feat && !requirementId) {
        requirementId = feat.requirementId;
      }
    }

    const count = await Issue.countDocuments({ projectId });
    const code = req.body.code || `ISS-${String(count + 1).padStart(3, '0')}`;

    const issue = await Issue.create({
      projectId,
      requirementId,
      featureId,
      testCaseId,
      code,
      title,
      description: description || title,
      severity: severity || 'major',
      status: status || 'open'
    });

    const populated = await Issue.findById(issue._id)
      .populate('requirementId', 'reqCode title')
      .populate('featureId', 'code title')
      .populate('testCaseId', 'code title');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
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
