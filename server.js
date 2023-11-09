// /backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB - Taste-Book database'))
  .catch(err => console.log(err));


// Import Auth routes
const authRoutes = require('./routes/authRoutes');

// Use Auth routes
app.use('/api/auth', authRoutes);


// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});


// Require the authentication middleware
const authMiddleware = require('./middleware/authMiddleware');


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
