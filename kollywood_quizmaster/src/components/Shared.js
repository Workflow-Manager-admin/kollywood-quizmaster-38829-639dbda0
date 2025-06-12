import React from "react";
import "./Shared.css";

// PUBLIC_INTERFACE
export function ProgressBar({ current, total }) {
  const percent = Math.min(100, (current / total) * 100);
  return (
    <div className="progressbar">
      <div className="progressbar-inner" style={{ width: percent + "%" }} />
      <div className="progressbar-label">{current} / {total}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Clue({ clue, index }) {
  return (
    <div className="clue" style={{ background: "var(--primary)", color: "#232323" }}>
      <span style={{ background: "var(--secondary)", color: "#fff", marginRight: 6, borderRadius: 4, padding: "2px 8px" }}>Clue {index + 1}</span>
      {clue}
    </div>
  );
}

// PUBLIC_INTERFACE
export function RevealButton({ onClick, revealed }) {
  return (
    <button
      className="btn"
      style={{
        background: revealed ? "var(--accent)" : "var(--secondary)",
        color: "#fff",
        marginTop: 14,
      }}
      onClick={onClick}
      type="button"
    >
      {revealed ? "Revealed" : "Reveal Answer"}
    </button>
  );
}

// PUBLIC_INTERFACE
export function AnswerFeedback({ correct, message }) {
  return (
    <div
      style={{
        margin: "10px 0 0 0",
        padding: 10,
        borderRadius: 6,
        background: correct ? "#d2ffe2" : "#ffe2e2",
        color: correct ? "#02ad4e" : "#e73131",
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}
