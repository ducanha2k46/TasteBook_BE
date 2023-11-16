const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get('/random', recipeController.getRandomRecipes);

router.get('/search/:query', recipeController.searchRecipes);

router.get('/suggest/:term', recipeController.getSuggestions);

module.exports = router;
