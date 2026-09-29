const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: true,
      index: true
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
    complexity: {
      type: String,
      enum: ['easy', 'medium', 'complex'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['planned', 'in_development', 'implemented', 'blocked'],
      default: 'planned'
    }
  },
  { timestamps: true }
);

featureSchema.index({ projectId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Feature', featureSchema);
