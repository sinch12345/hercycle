const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const logRoutes = require('./routes/logs');

const app = express();

app.use(cors());
app.use(express.json());

console.log('Attempting MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error(err);
  });

app.get('/', (req, res) => {
  res.json({ message: 'HerCycle API is running 🌙' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HerCycle server running on http://localhost:${PORT}`);
});