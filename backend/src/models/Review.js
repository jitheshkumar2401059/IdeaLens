const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      default: 1
    },
    statusDecision: {
      type: String,
      enum: ['approved', 'revision_requested', 'rejected', 'under_review'],
      required: true
    },
    comments: {
      type: String,
      required: true
    },
    criteriaRatings: {
      problemClarity: { type: Number, min: 1, max: 5, default: 4 },
      innovationNovelty: { type: Number, min: 1, max: 5, default: 4 },
      technicalFeasibility: { type: Number, min: 1, max: 5, default: 4 },
      societalImpact: { type: Number, min: 1, max: 5, default: 4 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
