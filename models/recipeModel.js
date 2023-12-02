const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  url: String,
  image: String,
  name: String,
  description: String,
  author: String,
  ratings: Number,
  ingredients: [String],
  steps: [String],
  nutrients: {
    kcal: String,
    fat: String,
    saturates: String,
    carbs: String,
    sugars: String,
    fibre: String,
    protein: String,
    salt: String
  },
  times: {
    Preparation: String,
    Cooking: String
  },
  serves: Number,
  difficult: String,
  vote_count: Number,
  subcategory: String,
  dish_type: String,
  maincategory: String
});

module.exports = mongoose.model('Recipe', recipeSchema);
