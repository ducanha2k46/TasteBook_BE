const Recipe = require('../models/recipeModel');
const mongoose = require('mongoose');

exports.getRandomRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.aggregate([{ $sample: { size: 15 } }]);
        res.json(recipes);
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.searchRecipes = async (req, res) => {
    try {
        const { query } = req.params;
        const regexQuery = new RegExp(query, 'i'); 
        const recipes = await Recipe.find({
            $or: [
                { name: { $regex: regexQuery } },
                { description: { $regex: regexQuery } },
                { ingredients: { $elemMatch: { $regex: regexQuery } } }
            ]
        });
        res.json(recipes);
    } catch (err) {
        res.status(500).send(err);
    }
};



exports.getSuggestions = async (req, res) => {
    try {
        const { term } = req.params;
        const regexTerm = new RegExp(term, 'i'); 
        const suggestions = await Recipe.find({
            ingredients: { $elemMatch: { $regex: regexTerm } }
        }).limit(5);
        res.json(suggestions.map(s => s.name));
    } catch (err) {
        res.status(500).send(err);
    }
};


exports.getRecipeById = async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({message: 'Server Error'});
    }
};