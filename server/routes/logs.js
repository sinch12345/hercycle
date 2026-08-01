const express = require('express');
const Log = require('../models/Log');
const requireAuth = require('../middleware/auth');
const { getPredictions } = require('../utils/predictions');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.userId }).sort({ date: 1 });
    res.json({ logs });
  } catch (err) {
    console.error('Fetch logs error:', err);
    res.status(500).json({ error: 'Could not fetch logs.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, flow, symptoms, sleep } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required.' });
    }
    const log = await Log.findOneAndUpdate(
      { userId: req.userId, date },
      { flow, symptoms, sleep },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ log });
  } catch (err) {
    console.error('Save log error:', err);
    res.status(500).json({ error: 'Could not save log entry.' });
  }
});

router.get('/predictions', async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.userId }).sort({ date: 1 });
    const predictions = getPredictions(logs);
    res.json({ predictions });
  } catch (err) {
    console.error('Predictions error:', err);
    res.status(500).json({ error: 'Could not compute predictions.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const log = await Log.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) return res.status(404).json({ error: 'Log not found.' });
    res.json({ message: 'Log deleted.' });
  } catch (err) {
    console.error('Delete log error:', err);
    res.status(500).json({ error: 'Could not delete log.' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Log.deleteMany({ userId: req.userId });
    res.json({ message: 'All logs deleted.' });
  } catch (err) {
    console.error('Wipe logs error:', err);
    res.status(500).json({ error: 'Could not wipe logs.' });
  }
});

module.exports = router;