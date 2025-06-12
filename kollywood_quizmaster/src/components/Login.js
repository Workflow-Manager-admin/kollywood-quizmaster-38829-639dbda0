import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Login.css";

// PUBLIC_INTERFACE
export default function Login() {
  const { setUser } = useApp();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  function onLogin(e) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setUser(username);
      setLoading(false);
    }, 500);
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={onLogin}>
        <h2 className="title" style={{ color: "var(--secondary)" }}>Kollywood QuizMaster</h2>
        <p>Login to play Kollywood movie quiz games!</p>
        <input
          required
          className="login-input"
          type="text"
          placeholder="Enter your username"
          value={username}
          minLength={2}
          maxLength={24}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="btn btn-large" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
