const express = require("express");
const router = express.Router();

const { searchCollege, recommendCollege } = require("../controllers/apiController");

// Use same endpoints as frontend expects
router.get("/searchCollege", searchCollege);
router.get("/recommendCollege", recommendCollege);

module.exports = router;
