import React, { useEffect, useState } from "react";
import { getKollywoodMovies, getGenres } from "../tmdbApi";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const BINGO_SIZE = 5;

// Sample bingo categories—expand with more/cond. format from TMDB genres!
function getBingoCategories(genres) {
  const preset = [
    "Romance", "Comedy", "Action", "Thriller", "Drama", "Family",
    "Horror", "Crime", "Adventure", "Fantasy", "Science Fiction",
    "Mystery", "History", "Music", "War", "Western", "Animation",
    "Biography", "Sport", "Musical", "Political", "Award Winner",
    "Box-office Hit", "Classic", "New Release", "Festival Favorite"
  ];
  if (genres && genres.length >= 10) {
    // Only english genre names
    return genres.map(g => g.name).concat(preset).slice(0, BINGO_SIZE * BINGO_SIZE);
  }
  return preset.slice(0, BINGO_SIZE * BINGO_SIZE);
}

// Lay out bingo in a BOARD! (rows x cols = 5x5)
function buildBingoGrid(categories) {
  const shuffled = categories.sort(() => Math.random() - 0.5);
  const grid = [];
  for (let r = 0; r < BINGO_SIZE; r++) {
    grid.push(shuffled.slice(r * BINGO_SIZE, (r + 1) * BINGO_SIZE));
  }
  return grid;
}

// PUBLIC_INTERFACE
export default function MovieBingo() {
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [bingoGrid, setBingoGrid] = useState([]); // RoWs
  const [selected, setSelected] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const { setResults, setActiveGame } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveGame("Movie Bingo");
    async function load() {
      const genres = await getGenres();
      setGenres(genres);
      const { results } = await getKollywoodMovies({ page: 3 });
      setMovies(results);
      const cats = getBingoCategories(genres);
      setBingoGrid(buildBingoGrid(cats));
    }
    load();
    // eslint-disable-next-line
  }, []);

  const handleCellClick = (cat) => {
    // For demo: consider correct if the user selects at least one cell in each row
    const flatMovies = movies || [];
    let isCorrect = flatMovies.some((m) => m.genre_ids && m.genre_ids.some(id => genres.find(g => g.name === cat && g.id === id)));
    setSelected((prev) => ({ ...prev, [cat]: !prev[cat] }));
    if (isCorrect) setScore((s) => s + 1);
    // Win if user selects cells in all rows (simulate quick win for small quiz)
    if (Object.keys(selected).length + 1 >= 10) {
      setFinished(true);
      setResults({
        score,
        total: BINGO_SIZE * BINGO_SIZE,
        detail: "Movie Bingo Finished!",
      });
      navigate("/results");
    }
  };

  if (!bingoGrid.length) {
    return <div style={{ padding: 44 }}>Loading Movie Bingo...</div>;
  }

  return (
    <div className="quiz-container">
      <h2 className="title" style={{ color: "var(--secondary)", marginTop: 42 }}>Movie Bingo</h2>
      <div className="subtitle" style={{ margin: 14 }}>Click categories you can name a movie for!</div>
      <div className="bingo-board">
        {bingoGrid.map((row, i) => (
          <div key={i} className="bingo-row">
            {row.map((cat, j) => (
              <div
                key={cat}
                className={
                  "bingo-cell" +
                  (selected[cat] ? " selected" : "")
                }
                onClick={() => handleCellClick(cat)}
                style={{
                  background: selected[cat] ? "var(--secondary)" : "#fff",
                  color: selected[cat] ? "#fff" : "#0f3460"
                }}
                tabIndex={0}
              >
                {cat}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        className="btn btn-large"
        style={{ marginTop: 24, background: "var(--accent)", color: "#fff" }}
        onClick={() => {
          setFinished(true);
          setResults({ score, total: BINGO_SIZE * BINGO_SIZE, detail: "Movie Bingo Complete!" });
          navigate("/results");
        }}
      >
        Finish Bingo
      </button>
    </div>
  );
}
