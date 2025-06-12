import React, { createContext, useContext, useState } from "react";

// PUBLIC_INTERFACE
const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null); // {score, questions, etc.}
  const [activeGame, setActiveGame] = useState(null);

  // For multi-game support, store answers and state here
  const [gameState, setGameState] = useState({}); // keyed by game

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        results,
        setResults,
        activeGame,
        setActiveGame,
        gameState,
        setGameState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useApp() {
  return useContext(AppContext);
}
