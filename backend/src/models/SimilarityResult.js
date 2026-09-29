const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    similarProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    title: { type: String, required: true },
    domain: { type: String, default: '' },
    similarityPercentage: { type: Number, required: true },
    domainMatch: { type: Boolean, default: false },
    technologyMatchScore: { type: Number, default: 0 },
    textMatchScore: { type: Number, default: 0 },
    matchingTechnologies: { type: [String], default: [] },
    matchingProblemConcepts: { type: [String], default: [] },
    matchingSolutionConcepts: { type: [String], default: [] },
    differences: { type: [String], default: [] }
  },
  { _id: false }
);

const similarityResultSchema = new mongoose.Schema(
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
    topMatches: {
      type: [matchSchema],
      default: []
    },
    totalProjectsCompared: {
      type: Number,
      default: 0
    },
    highestSimilarityPercentage: {
      type: Number,
      default: 0
    },
    averageSimilarityPercentage: {
      type: Number,
      default: 0
    },
    disclaimer: {
      type: String,
      default:
        'AI-Assisted Similarity Notice: This analysis provides educational algorithmic similarity and differentiation comparisons against existing projects in the IdeaLens database. It does not constitute a legal patentability search, intellectual property audit, or legal novelty determination.'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SimilarityResult', similarityResultSchema);
