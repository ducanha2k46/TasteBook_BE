const Recipe = require('../models/recipeModel');

exports.getRandomRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.aggregate([{ $sample: { size: 12 } }]);
        res.json(recipes);
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.searchRecipes = async (req, res) => {
    try {
        const { query } = req.params;
        const recipes = await Recipe.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { ingredients: { $regex: query, $options: 'i' } }
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
        const suggestions = await Recipe.find({
            name: { $regex: term, $options: 'i' }
        }).limit(5); // Limiting the number of suggestions
        res.json(suggestions.map(s => s.name)); // Send back only names
    } catch (err) {
        res.status(500).send(err);
    }
};
