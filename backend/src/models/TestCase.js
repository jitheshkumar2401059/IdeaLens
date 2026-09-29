const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    featureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feature',
      required: true,
      index: true
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
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
      default: ''
    },
    expectedResult: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'blocked'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

testCaseSchema.index({ projectId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('TestCase', testCaseSchema);
