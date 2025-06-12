import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { getKollywoodMovies, getMovieDetails } from "../tmdbApi";
import { ProgressBar, AnswerFeedback } from "../components/Shared";
import { useNavigate } from "react-router-dom";

const QUIZ_LENGTH = 8;

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// PUBLIC_INTERFACE
export default function MovieTimeline() {
  const [questions, setQuestions] = useState([]);
  const [order, setOrder] = useState([]); // array of indexes, user order
  const [attempted, setAttempted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [index, setIndex] = useState(0);
  const [dragged, setDragged] = useState(null);

  const { setResults, setActiveGame } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveGame("Movie Timeline Challenge");
    async function load() {
      const { results } = await getKollywoodMovies({ page: 4 });
      const picks = shuffle(results).slice(0, QUIZ_LENGTH);
      // Fetch years
      const picksWithYear = await Promise.all(
        picks.map(async (movie) => {
          // Always use TMDB details in ENGLISH
          const details = await getMovieDetails(movie.id);
          return {
            ...movie,
            // English release year fallback
            release_year: details.release_date ? details.release_date.slice(0,4) : "????",
            english_title: details.title || details.original_title
          };
        })
      );
      setQuestions([picksWithYear]);
      setOrder(shuffle([...Array(QUIZ_LENGTH).keys()])); // shuffled indices
    }
    load();
    // eslint-disable-next-line
  }, []);

  if (!questions.length) {
    return <div style={{ padding: 44 }}>Loading timeline quiz...</div>;
  }

  const movies = questions[0] || [];
  const handleDragStart = idx => setDragged(idx);

  function handleDrop(toIdx) {
    const newOrder = [...order];
    const fromIdx = newOrder.indexOf(dragged);
    [newOrder[fromIdx], newOrder[toIdx]] = [newOrder[toIdx], newOrder[fromIdx]];
    setOrder(newOrder);
    setDragged(null);
  }

  function checkOrder() {
    const correct = movies
      .map((_, idx) => idx)
      .sort((a, b) => movies[a].release_year.localeCompare(movies[b].release_year));
    const user = order;
    let win = 0;
    for (let i = 0; i < correct.length; i++) {
      if (movies[correct[i]].title === movies[user[i]].title) win += 1;
    }
    setScore(win);
    setFeedback({
      correct: win === QUIZ_LENGTH,
      message:
        win === QUIZ_LENGTH
          ? "All correct! 🎉"
          : `You got ${win} out of ${QUIZ_LENGTH} in the correct order.`
    });
    setAttempted(true);
  }

  function finishQuiz() {
    setResults({
      score: score,
      total: QUIZ_LENGTH,
      detail: "Timeline Challenge complete!"
    });
    navigate("/results");
  }

  return (
    <div className="quiz-container">
      <h2 className="title" style={{ color: "var(--secondary)", marginTop: 42 }}>
        Movie Timeline Challenge
      </h2>
      <ProgressBar current={1} total={1} />
      <div className="subtitle" style={{ margin: 20 }}>
        Drag-and-drop to arrange the movies from <b>earliest</b> to <b>latest</b> release!
      </div>
      <div className="timeline-list" style={{ minWidth: 350, maxWidth: 400, margin: "32px auto" }}>
        {order.map((oIdx, pos) => (
          <div
            className="timeline-item"
            key={oIdx}
            draggable
            onDragStart={() => handleDragStart(oIdx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => dragged !== null && handleDrop(pos)}
            style={{
              padding: "16px 18px",
              fontSize: 18,
              background: "#fff",
              color: "#2b2c32",
              borderRadius: 8,
              border: "2px solid var(--secondary)",
              marginBottom: 10,
              opacity: dragged === oIdx ? 0.45 : 1,
              cursor: dragged === oIdx ? "grabbing" : "grab"
            }}
          >
            {movies[oIdx].title}
          </div>
        ))}
      </div>
      {feedback && <AnswerFeedback {...feedback} />}
      {!attempted ? (
        <button className="btn btn-large" onClick={checkOrder} style={{background:"var(--secondary)",color:"#fff"}}>
          Check Order
        </button>
      ) : (
        <button className="btn btn-large" onClick={finishQuiz} style={{ marginTop: 16, background:"var(--accent)", color:"#fff" }}>
          Finish Game
        </button>
      )}
    </div>
  );
}
