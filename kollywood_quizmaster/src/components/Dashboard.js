import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const games = [
  {
    id: "blurred-poster",
    name: "Blurred Poster Quiz",
    icon: "🖼️",
    color: "#ff00c8",
    description: "Guess Kollywood movies from their blurred posters. Use clues!",
    route: "/quiz/blurred-poster",
  },
  {
    id: "character-match",
    name: "Character-Movie Match",
    icon: "🎭",
    color: "#27ae60",
    description: "Match famous characters to their movies.",
    route: "/quiz/character-match",
  },
  {
    id: "movie-bingo",
    name: "Movie Bingo",
    icon: "🎫",
    color: "#f39c12",
    description: "Click movies matching bingo grid categories!",
    route: "/quiz/movie-bingo",
  },
  {
    id: "timeline",
    name: "Movie Timeline Challenge",
    icon: "📅",
    color: "#0f3460",
    description: "Arrange movies by release year in correct order.",
    route: "/quiz/timeline",
  },
  {
    id: "spin-the-wheel",
    name: "Spin the Wheel",
    icon: "🎡",
    color: "#2980b9",
    description: "Spin to select actor/year/movie. Guess the film!",
    route: "/quiz/spin-the-wheel",
  },
  {
    id: "cast-combo",
    name: "Cast Combo",
    icon: "👥",
    color: "#e74c3c",
    description:
      "Name the movie by seeing 2-3 actors (or find the odd one out).",
    route: "/quiz/cast-combo",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h2 className="title" style={{ margin: "32px 0 12px 0", color: "var(--secondary)" }}>Welcome!</h2>
      <div className="subtitle" style={{ marginBottom: 36 }}>
        Choose a Kollywood quiz game to start playing!
      </div>
      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            style={{ borderColor: game.color }}
            onClick={() => navigate(game.route)}
            tabIndex={0}
            role="button"
          >
            <span
              className="game-icon"
              style={{
                background: game.color,
                boxShadow: `0 5px 25px 0 ${game.color}44`,
              }}
            >
              {game.icon}
            </span>
            <div className="game-title">{game.name}</div>
            <div className="game-description">{game.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
