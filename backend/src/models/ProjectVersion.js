const mongoose = require('mongoose');

const projectVersionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    problemStatement: {
      type: String,
      required: true
    },
    proposedSolution: {
      type: String,
      required: true
    },
    targetUsers: {
      type: String,
      required: true
    },
    domain: {
      type: String,
      required: true
    },
    technologies: {
      type: [String],
      default: []
    },
    keyFeatures: {
      type: [String],
      default: []
    },
    expectedOutcome: {
      type: String,
      required: true
    },
    references: {
      type: [String],
      default: []
    },
    changeSummary: {
      type: String,
      default: 'Initial version created'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    analysisSnapshot: {
      type: mongoose.Schema.Types.Mixed
    },
    similaritySnapshot: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

projectVersionSchema.index({ projectId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model('ProjectVersion', projectVersionSchema);
