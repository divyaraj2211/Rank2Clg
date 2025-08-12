import React, { useState } from "react";
import axios from "axios";
import "./CollegeFinder.css";

function CollegeFinder() {
  const [exam, setExam] = useState("jee");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("recommend"); // recommend or search
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;
  const API_BASE = "http://localhost:5000/api";

  const getColleges = async (url, params) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${url}`, { params });
      setResults(res.data);
      setPage(1);
    } catch (e) {
      console.log(e);
      alert("Something went wrong!");
    }
    setLoading(false);
  };

  const handleRecommend = () => {
    if (!exam || !rank || !category) {
      alert("Fill all fields");
      return;
    }
    getColleges("recommendCollege", { exam, rank, category });
  };

  const handleSearch = () => {
    if (!exam || !collegeName) {
      alert("Enter exam and college name");
      return;
    }
    getColleges("searchCollege", { exam, name: collegeName });
  };

  const calculateChance = (predicted) => {
    const r = parseInt(rank);
    if (!predicted || !r) return 0;
    if (r <= predicted) {
      return (((predicted - r) / predicted) * 50 + 50).toFixed(1);
    } else {
      let diff = (r - predicted) / predicted;
      return Math.max(0, (50 - diff * 50)).toFixed(1);
    }
  };

  const start = (page - 1) * itemsPerPage;
  const paginated = results.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="cf-container">
      <h1 className="cf-title">College Finder</h1>

      {/* Mode buttons */}
      <div className="cf-mode-switch">
        <button
          className={`cf-btn ${mode === "recommend" ? "active" : ""}`}
          onClick={() => setMode("recommend")}
        >
          Recommend by Rank
        </button>
        <button
          className={`cf-btn ${mode === "search" ? "active" : ""}`}
          onClick={() => setMode("search")}
        >
          Search by College Name
        </button>
      </div>

      {/* Input fields */}
      {mode === "recommend" ? (
        <div className="cf-inputs">
          <select value={exam} onChange={(e) => setExam(e.target.value)}>
            <option value="jee">JEE</option>
            <option value="neet">NEET</option>
            <option value="gujcet">GUJCET</option>
          </select>
          <input type="number" placeholder="Rank" value={rank} onChange={(e) => setRank(e.target.value)} />
          <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <button className="cf-btn primary" onClick={handleRecommend}>
            Get Recommendations
          </button>
        </div>
      ) : (
        <div className="cf-inputs">
          <select value={exam} onChange={(e) => setExam(e.target.value)}>
            <option value="jee">JEE</option>
            <option value="neet">NEET</option>
            <option value="gujcet">GUJCET</option>
          </select>
          <input type="text" placeholder="College name" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
          <button className="cf-btn primary" onClick={handleSearch}>
            Search College
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {/* Results */}
      {!loading &&
        paginated.map((clg, i) => {
          // we use a variable for chance instead of inline &&
          let chanceElement = null;
          if (mode === "recommend" && rank && clg.Predicted_Rank_2025) {
            chanceElement = (
              <p className="chance">
                <b>Chance:</b> {calculateChance(clg.Predicted_Rank_2025)}%
              </p>
            );
          }

          return (
            <div key={i} className="cf-card">
              <div className="cf-card-left">
                <h3>{clg.College}</h3>
                <p><b>Course:</b> {clg.Course}</p>
                <p><b>Category:</b> {clg.Category}</p>
                {chanceElement}
              </div>
              <div className="cf-card-right">
                {[2020, 2021, 2022, 2023, 2024].map((y) => (
                  <div key={y} className="rank-column">
                    <p><b>{y}</b><br />{clg[`Allotted_Rank_${y}`] || "-"}</p>
                  </div>
                ))}
                <div className="rank-column highlight-col">
                  <p><b>Pred 2025</b><br />{clg.Predicted_Rank_2025 || "-"}</p>
                </div>
              </div>
            </div>
          );
        })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="cf-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

export default CollegeFinder;
