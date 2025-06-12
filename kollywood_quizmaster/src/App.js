import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import BlurredPosterQuiz from "./games/BlurredPosterQuiz";
import CharacterMovieMatch from "./games/CharacterMovieMatch";
import MovieBingo from "./games/MovieBingo";
import MovieTimeline from "./games/MovieTimeline";
import SpinTheWheel from "./games/SpinTheWheel";
import CastCombo from "./games/CastCombo";
import ResultsSummary from "./components/ResultsSummary";
import "./App.css";

function AppRoutes() {
  const { user, results, setResults, activeGame } = useApp();

  return (
    <Router>
      <Navbar />
      <main>
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/quiz/blurred-poster"
              element={user ? <BlurredPosterQuiz /> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz/character-match"
              element={user ? <CharacterMovieMatch /> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz/movie-bingo"
              element={user ? <MovieBingo /> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz/timeline"
              element={user ? <MovieTimeline /> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz/spin-the-wheel"
              element={user ? <SpinTheWheel /> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz/cast-combo"
              element={user ? <CastCombo /> : <Navigate to="/login" />}
            />
            <Route
              path="/results"
              element={user && results ? (
                <ResultsSummary
                  results={results}
                  onRestart={() => setResults(null)}
                  game={activeGame}
                />
              ) : (
                <Navigate to={user ? "/" : "/login"} />
              )}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <div className="app app-movie-theme">
        <AppRoutes />
      </div>
    </AppProvider>
  );
}

export default App;
