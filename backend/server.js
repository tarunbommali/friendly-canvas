require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const trackRoutes = require('./routes/tracks');
const postRoutes = require('./routes/posts');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/tracks', trackRoutes);
app.use('/api/posts', postRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

module.exports = app;
