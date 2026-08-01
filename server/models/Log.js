// ==========================================================
// LOG MODEL
// One document per daily check-in entry
// ==========================================================

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // stored as 'YYYY-MM-DD' to match frontend format
    required: true,
  },
  flow: {
    type: String,
    enum: ['none', 'spotting', 'light', 'medium', 'heavy'],
    default: 'none',
  },
  symptoms: {
    type: [String],
    default: [],
  },
  sleep: {
    type: Number,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

// one entry per user per date — saving the same date again updates it
logSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Log', logSchema);