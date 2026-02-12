const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  notes: String  // Personal notes about why saved
}, { timestamps: true });

// Indexes
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
savedJobSchema.index({ userId: 1 });
savedJobSchema.index({ savedAt: -1 });

// Static method to find saved jobs by user
savedJobSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).populate('jobId').sort({ savedAt: -1 });
};

// Static method to check if job is saved by user
savedJobSchema.statics.isJobSaved = function(userId, jobId) {
  return this.findOne({ userId, jobId }).then(saved => !!saved);
};

// Instance method to add notes
savedJobSchema.methods.addNotes = function(notes) {
  this.notes = notes;
  return this.save();
};

module.exports = mongoose.model('SavedJob', savedJobSchema);