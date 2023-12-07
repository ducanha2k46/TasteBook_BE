// /backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  nickname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: Date, required: true },
  gender: { type: String, required: true },
  role: { type: String, default: 'user' }, // Mặc định là 'user'
  avatarUrl: { type: String, default: 'https://www.gravatar.com/avatar/?d=identicon' },
  biography: { type: String, required: false },
  savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
});

module.exports = mongoose.model('User', userSchema);
