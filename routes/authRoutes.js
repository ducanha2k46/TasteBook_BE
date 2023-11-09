// /backend/routes/authRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

// Đăng ký route
router.post('/register', async (req, res) => {
  try {
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Tạo user mới
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      birthDate: req.body.birthDate,
      gender: req.body.gender
    });

    // Lưu user
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Đăng nhập route
router.post('/login', async (req, res) => {
  try {
    // Kiểm tra xem có user với email đó không
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // So sánh mật khẩu
      if (await bcrypt.compare(req.body.password, user.password)) {
        
    // Kiểm tra xem có user với email đó không
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      // Tạo JWT token
      const token = jwt.sign(
        { id: user._id }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '1h' }
      );
      res.json({ token: token });
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
    }

      } else {
        res.status(400).json({ message: "Mật khẩu không chính xác." });
      }
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Lấy thông tin cá nhân của người dùng
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Tìm người dùng dựa trên thông tin trong req.user
    const user = await User.findById(req.user.id).select('-password'); // Loại bỏ mật khẩu khỏi response
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
