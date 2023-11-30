const Recipe = require('../models/recipeModel');

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

