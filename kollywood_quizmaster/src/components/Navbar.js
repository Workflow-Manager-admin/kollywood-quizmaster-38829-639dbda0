import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

function Navbar() {
  const { user, setUser, setActiveGame, setResults } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    setUser(null);
    setActiveGame(null);
    setResults(null);
    navigate("/login");
  }

  return (
    <nav className="navbar" style={{ background: "var(--primary)" }}>
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-symbol" style={{ color: "var(--secondary)" }}>
            🎬
          </span>
          Kollywood QuizMaster
        </Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {user && <div className="navbar-user">👤 {user}</div>}
          {user ? (
            <button className="btn" onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <Link to="/login" className="btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
