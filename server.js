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
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB - Taste-Book database'))
  .catch(err => console.log(err));


const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
app.use('/uploads', express.static('uploads'));
app.use('/api/uploads', uploadRoutes);
app.use('/api/user', userRoutes);


app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);


app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

const authMiddleware = require('./middleware/authMiddleware');

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

