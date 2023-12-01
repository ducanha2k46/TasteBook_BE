// /backend/routes/authRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      birthDate: req.body.birthDate,
      nickname: req.body.lastName + " " + req.body.firstName,
      gender: req.body.gender
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Người dùng đã tồn tại" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (await bcrypt.compare(req.body.password, user.password)) {

        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
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

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
      return res.status(400).send({message :'Current and new password are required'});
  }

  try {
      const user = await User.findById(req.user.id); 
      if (!user) {
          return res.status(404).send({message: 'Người dùng không tồn tại.'});
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(401).send({message: 'Sai mật khẩu'});
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();

      res.send({message: 'Đổi mật khẩu thành công'});
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
});

router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: "Sai mật khẩu" });
      }

      await User.deleteOne({ _id: req.user.id });
      res.status(200).json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});