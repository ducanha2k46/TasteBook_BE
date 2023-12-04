const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/save-recipe/:recipeId', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Lấy ID người dùng từ middleware xác thực
    const { recipeId } = req.params; // Lấy ID công thức từ URL
    console.log('UserId:', userId, 'RecipeId:', recipeId);

    try {
        // Thêm công thức vào mảng savedRecipes của người dùng
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $addToSet: { savedRecipes: recipeId } // Sử dụng $addToSet để tránh trùng lặp
        }, { new: true }); // Option { new: true } để nhận lại dữ liệu đã cập nhật

        if (updatedUser) {
            res.status(200).send('Công thức đã được lưu.');
        } else {
            res.status(404).send('Người dùng không tìm thấy.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Có lỗi xảy ra khi lưu công thức.');
    }
});

router.get('/is-saved/:recipeId', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { recipeId } = req.params;

    try {
        const user = await User.findById(userId);
        const isSaved = user.savedRecipes.includes(recipeId);
        res.status(200).json({ isSaved });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server.');
    }
});

router.post('/remove-recipe/:recipeId', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { recipeId } = req.params;

    try {
        await User.findByIdAndUpdate(userId, {
            $pull: { savedRecipes: recipeId } 
        });
        res.status(200).send('Công thức đã được xóa khỏi danh sách lưu.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server.');
    }
});

router.get('/random', recipeController.getRandomRecipes);

router.get('/search/:query', recipeController.searchRecipes);

router.get('/suggest/:term', recipeController.getSuggestions);
router.get('/:id', recipeController.getRecipeById);


module.exports = router;
