const mongoose = require("mongoose");

const cutoffSchema = new mongoose.Schema({
  College: String,
  Course: String,
  Category: String,
  Allotted_Rank_2023: Number,
  Allotted_Rank_2024: Number,
  Predicted_Rank_2025: Number
});

module.exports = mongoose.model("gujcetCutoff", cutoffSchema, "gujcetCutoff");
