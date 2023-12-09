const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const Recipe = require('../models/recipeModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });
router.post('/save-recipe/:recipeId', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { recipeId } = req.params;
    console.log('UserId:', userId, 'RecipeId:', recipeId);

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $addToSet: { savedRecipes: recipeId }
        }, { new: true });

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
const FormData = require('form-data');
function extractDisplayNames(data) {
    const items = data.items || [];
    let displayNames = [];

    items.forEach(item => {
        item.food.forEach(foodItem => {
            if (foodItem.confidence >= 0.7) {
                displayNames.push(foodItem.food_info.display_name);
            }
        });
    });

    return displayNames;
}
router.post('/analyze-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Không có file ảnh nào được tải lên.');
    }

    try {
        const form = new FormData();
        const filePath = req.file.path;
        form.append('image', fs.createReadStream(filePath));

        const foodvisorResponse = await axios.post(
            'https://vision.foodvisor.io/api/1.0/en/analysis/AnalysisFood',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': 'Api-Key yCjRu9LP.xBAgLcGUs3wwbdWTpRdCVZhiExhNeDi0'
                }
            }
        );

        // Xóa file sau khi gửi
        fs.unlinkSync(filePath);
        const displayNames = extractDisplayNames(foodvisorResponse.data);
        res.json({ displayNames: displayNames });
    } catch (error) {
        console.error('Lỗi khi phân tích ảnh:', error);
        if (error.response) {
            console.error('Phản hồi từ API:', error.response.data);
        }
        res.status(500).send('Lỗi server khi phân tích ảnh');
        
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
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
});

router.delete('/delete/:recipeId', authMiddleware, async (req, res) => {
    try {
        const recipeId = req.params.recipeId;
        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ message: 'Công thức không tìm thấy' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tìm thấy' });
        }

        if (recipe.author !== user.nickname) {
            return res.status(401).json({ message: 'Bạn không có quyền xóa công thức này' });
        }

        await Recipe.deleteOne({ _id: recipeId });
        res.status(200).json({ message: 'Công thức đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/author/:authorName', recipeController.getRecipesByAuthor);

router.get('/random', recipeController.getRandomRecipes);

router.get('/search/:query', recipeController.searchRecipes);

router.get('/suggest/:term', recipeController.getSuggestions);
router.get('/:id', recipeController.getRecipeById);


module.exports = router;
