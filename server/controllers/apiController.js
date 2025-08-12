const JeeCutoff = require("../models/jeeCutoff");
const NeetCutoff = require("../models/neetCutoff");
const GujcetCutoff = require("../models/gujcetCutoff");

const getModel = (exam) => {
  switch (exam.toLowerCase()) {
    case "neet": return NeetCutoff;
    case "jee": return JeeCutoff;
    case "gujcet": return GujcetCutoff;
    default: return null;
  }
};

exports.recommendCollege = async (req, res) => {
  try {
    const { exam, rank, category } = req.query;

    if (!exam || !rank || !category) {
      return res.status(400).json({ msg: "Exam, rank, and category are required" });
    }

    const userRank = parseInt(rank, 10);
    if (isNaN(userRank)) {
      return res.status(400).json({ msg: "Rank must be a number" });
    }

    const Model = getModel(exam);
    if (!Model) return res.status(400).json({ msg: "Invalid exam" });

    // Exact category match
    const query = {
      Category: category.toUpperCase(), 
      Predicted_Rank_2025: { $gte: userRank }
    };

    const projection = {
      _id: 0,
      College: 1,
      Course: 1,
      Category: 1,
      Allotted_Rank_2023: 1,
      Allotted_Rank_2024: 1,
      Predicted_Rank_2025: 1
    };

    // NEET has more years
    if (exam.toLowerCase() === "neet") {
      projection.Allotted_Rank_2020 = 1;
      projection.Allotted_Rank_2021 = 1;
      projection.Allotted_Rank_2022 = 1;
    }

    const results = await Model.find(query)
      .select(projection)
      .sort({ Predicted_Rank_2025: 1 })
      .limit(50);

    if (!results.length) {
      return res.status(404).json({ msg: "No colleges found for given rank and category" });
    }

    res.json(results);
  } catch (err) {
    console.error("Error in recommendCollege:", err);
    res.status(500).send("Server Error");
  }
};


exports.searchCollege = async (req, res) => {
  try {
    const { exam, name } = req.query;

    if (!exam || !name) {
      return res.status(400).json({ msg: "Exam and college name are required" });
    }

    const Model = getModel(exam);
    if (!Model) return res.status(400).json({ msg: "Invalid exam" });

    const regex = new RegExp(name, "i");

    const results = await Model.find({ College: regex })
      .select({
        College: 1,
        Course: 1,
        Category: 1,
        Allotted_Rank_2020: 1,
        Allotted_Rank_2021: 1,
        Allotted_Rank_2022: 1,
        Allotted_Rank_2023: 1,
        Allotted_Rank_2024: 1,
        Predicted_Rank_2025: 1,
        _id: 0
      })
      .limit(50);;

    if (!results.length) {
      return res.status(404).json({ msg: "No college found" });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
