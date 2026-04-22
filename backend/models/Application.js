const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: String,
  coverLetter: String,
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired', 'resigned', 'terminated'],
    default: 'applied',
  },
  // Feedback Fields
  rejectionReason: String,
  shortlistNote: String,
  feedback: String,
  missingSkills: [String],
  appliedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
