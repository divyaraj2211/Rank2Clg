// src/components/CollegeDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CollegeDetails = () => {
  const { collegeName, branch } = useParams();
  const [cutoffData, setCutoffData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCutoffTrend = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/cutoffTrend?college=${encodeURIComponent(
            collegeName
          )}&branch=${encodeURIComponent(branch)}`
        );
        const data = await res.json();
        setCutoffData(data);
      } catch (err) {
        console.error("Error fetching cutoff trend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCutoffTrend();
  }, [collegeName, branch]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>College Details</h2>
      <p><strong>College:</strong> {collegeName}</p>
      <p><strong>Branch:</strong> {branch}</p>

      {loading ? (
        <p>Loading cutoff trend...</p>
      ) : cutoffData.length > 0 ? (
        <div style={{ maxWidth: "700px", marginTop: "20px" }}>
          <h3>Cutoff Trend</h3>
          <Line
            data={{
              labels: cutoffData.map((item) => item.year),
              datasets: [
                {
                  label: "Closing Rank",
                  data: cutoffData.map((item) => item.closingRank),
                  borderColor: "rgba(75,192,192,1)",
                  backgroundColor: "rgba(75,192,192,0.2)",
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Yearly Cutoff Trend" },
              },
            }}
          />
        </div>
      ) : (
        <p>No cutoff trend data available.</p>
      )}
    </div>
  );
};

export default CollegeDetails;
