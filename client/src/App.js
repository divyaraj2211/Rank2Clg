import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import CollegeDetails from "./components/CollegeDetails"; // ✅ Import it

export default function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/college/:id" element={<CollegeDetails />} /> {/* ✅ New route */}
        </Routes>
      </div>
    </Router>
  );
}
