import React from "react";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
export default function ResultsSummary({ results, onRestart, game }) {
  const navigate = useNavigate();
  let summary = null;

  if (!results)
    return (
      <div style={{ padding: 48 }}>
        <h2>Invalid Results – try playing again!</h2>
      </div>
    );

  summary = (
    <>
      <h2 className="title" style={{ margin: 0, color: "var(--secondary)" }}>
        Game Over!
      </h2>
      <div className="subtitle" style={{ margin: "8px 0" }}>
        Results for: <span style={{ color: "var(--accent)" }}>{game || "Quiz"}</span>
      </div>
      <div style={{
        background: "var(--primary)",
        color: "#262626",
        borderRadius: 12,
        margin: "18px auto 20px auto",
        maxWidth: 440,
        padding: 32,
        fontSize: 22,
        boxShadow: "0 1px 12px #cccccc44" }}>
        <strong>Score: </strong> {results.score} / {results.total}
        <br />
        {typeof results.detail === "string"
          ? results.detail
          : null}
      </div>
      <button className="btn btn-large" onClick={() => { onRestart(); navigate("/"); }}>
        Back to Dashboard
      </button>
    </>
  );

  return (
    <div
      style={{
        minHeight: 380,
        paddingTop: 90,
        textAlign: "center",
      }}
    >
      {summary}
    </div>
  );
}
