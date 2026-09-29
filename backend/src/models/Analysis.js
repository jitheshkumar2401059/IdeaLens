const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1
    },
    projectSummary: {
      type: String,
      required: true
    },
    problemAnalysis: {
      type: String,
      required: true
    },
    targetUsersAnalysis: {
      type: String,
      required: true
    },
    solutionAnalysis: {
      type: String,
      required: true
    },
    technologiesAnalysis: {
      type: String,
      required: true
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    potentialChallenges: {
      type: [String],
      default: []
    },
    innovationOpportunities: {
      type: [String],
      default: []
    },
    possibleImprovements: {
      featureImprovements: { type: [String], default: [] },
      technologyImprovements: { type: [String], default: [] },
      userExperienceImprovements: { type: [String], default: [] },
      scalabilityImprovements: { type: [String], default: [] },
      differentiationOpportunities: { type: [String], default: [] }
    },
    suggestedAdditionalFeatures: {
      type: [String],
      default: []
    },
    potentialRealWorldApplications: {
      type: [String],
      default: []
    },
    potentialLimitations: {
      type: [String],
      default: []
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    aiModelUsed: {
      type: String,
      default: 'gemini-1.5-flash'
    },
    isFallback: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);
