// ==========================================================
// USER MODEL
// Defines what a user document looks like in MongoDB
// ==========================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    age: { type: Number, default: null },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
  },
  cycleHistory: {
    lastPeriod: { type: String, default: null },
    avgLength: { type: Number, default: null },
    typicalFlow: { type: String, default: null },
  },
  pledgeAccepted: { type: Boolean, default: false },
  notifPrefs: {
    period: { type: Boolean, default: true },
    pill: { type: Boolean, default: true },
    weekly: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);