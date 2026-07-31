// ==========================================================
// HERCYCLE BACKEND — Entry point
// ==========================================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json()); // parses incoming JSON request bodies

// ---- Database connection ----
console.log('Attempting MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error(err);
  });

// ---- Test routes ----
app.get('/', (req, res) => {
  res.json({ message: 'HerCycle API is running 🌙' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- Start server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HerCycle server running on http://localhost:${PORT}`);
});