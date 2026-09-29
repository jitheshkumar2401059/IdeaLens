const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    reqCode: {
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
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed'],
      default: 'open'
    }
  },
  { timestamps: true }
);

requirementSchema.index({ projectId: 1, reqCode: 1 }, { unique: true });

module.exports = mongoose.model('Requirement', requirementSchema);
