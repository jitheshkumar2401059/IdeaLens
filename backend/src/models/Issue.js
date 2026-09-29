const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
    },
    featureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feature'
    },
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase'
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['minor', 'major', 'critical'],
      default: 'major'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);

issueSchema.index({ projectId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Issue', issueSchema);
