const User = require('../models/User');
const Recipe = require('../models/recipeModel'); 
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/updateAvatar', authMiddleware, async (req, res) => {
  const { avatarUrl } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true });

    // Sau khi cập nhật avatar, cập nhật authorImg trong tất cả công thức của người dùng này
    await Recipe.updateMany({ author: updatedUser.nickname }, { authorImg: avatarUrl });

    res.json({ success: true, updatedUser });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

module.exports = router;
