import React from "react";

export default function About() {
  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
      <h1>About College Predictor</h1>
      <p>
        This application helps students find colleges based on their entrance
        exam rank and category, or by directly searching for a college name.
      </p>
      <p>
        It supports multiple exams like JEE, NEET, and GUJCET and uses historical
        data with predicted ranks for upcoming years.
      </p>
    </div>
  );
}
