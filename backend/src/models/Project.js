const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
      trim: true
    },
    proposedSolution: {
      type: String,
      required: [true, 'Proposed solution is required'],
      trim: true
    },
    targetUsers: {
      type: String,
      required: [true, 'Target users must be specified'],
      trim: true
    },
    domain: {
      type: String,
      required: [true, 'Project domain is required'],
      index: true
    },
    technologies: {
      type: [String],
      required: [true, 'At least one technology is required'],
      default: []
    },
    keyFeatures: {
      type: [String],
      required: [true, 'At least one key feature is required'],
      default: []
    },
    expectedOutcome: {
      type: String,
      required: [true, 'Expected outcome is required']
    },
    references: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'revision_requested', 'resubmitted', 'approved', 'rejected'],
      default: 'draft',
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    currentVersion: {
      type: Number,
      default: 1
    },
    lastAnalyzedAt: {
      type: Date
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Text index for search
projectSchema.index({
  title: 'text',
  problemStatement: 'text',
  proposedSolution: 'text',
  technologies: 'text'
});

module.exports = mongoose.model('Project', projectSchema);
