import React from "react";
import CollegeFinder from "../components/CollegeFinder";

export default function Home() {
  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Find the Perfect College
      </h1>
      <CollegeFinder />
    </div>
  );
}
