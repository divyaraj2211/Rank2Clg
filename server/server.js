const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB (no .env)
mongoose.connect("mongodb://127.0.0.1:27017/college_predictor")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", require("./routes/apiRoutes"));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
