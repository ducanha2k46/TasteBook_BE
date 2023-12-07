const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const Recipe = require('../models/recipeModel');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Đảm bảo thư mục này tồn tại hoặc được tạo tự động
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });
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

router.get('/saved-recipes', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('savedRecipes');

        if (!user) {
            return res.status(404).send('Người dùng không tìm thấy');
        }

        res.status(200).json(user.savedRecipes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
});

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newRecipe = new Recipe({
            name: req.body.name,
            description: req.body.description,
            ingredients: req.body.ingredients,
            steps: req.body.steps,
            times: req.body.times,
            difficult: req.body.difficult,
            author: user.nickname, 
            image: req.body.image,
            authorImg: user.avatarUrl
        });
        console.log(req.file)
        console.log(req.body)
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/my-recipes', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const recipes = await Recipe.find({ author: user.nickname });
        res.json(recipes);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/upload-recipe-image', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('Không có file ảnh nào được tải lên.');
    }
  
    // Lấy URL của file ảnh
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  });
  

router.get('/author/:authorName', recipeController.getRecipesByAuthor);

router.get('/random', recipeController.getRandomRecipes);

router.get('/search/:query', recipeController.searchRecipes);

router.get('/suggest/:term', recipeController.getSuggestions);
router.get('/:id', recipeController.getRecipeById);


module.exports = router;
