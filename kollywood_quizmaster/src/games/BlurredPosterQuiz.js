import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  getKollywoodMovies,
  getMovieDetails,
  getPosterUrl,
} from "../tmdbApi";
import { ProgressBar, AnswerFeedback } from "../components/Shared";
import { useNavigate } from "react-router-dom";

const QUIZ_LENGTH = 10;

// Utility to blur an image with CSS
function BlurredImage({ src, alt, revealed }) {
  return (
    <div style={{
      margin: "16px auto",
      width: 260, height: 380,
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: revealed
        ? "0 0 16px 3px #0f346080, 0 3px 22px #ff00c850"
        : "0 0 21px 2px #8d8fa9cc"
    }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: revealed ? "none" : "blur(16px) brightness(0.7)",
          transition: "filter 0.25s"
        }}
      />
    </div>
  );
}

// ClueButton component for clickable clues
function ClickableClueButton({ clue, index, revealed, onReveal }) {
  return (
    <button
      className="btn"
      style={{
        background: revealed ? "var(--accent)" : "var(--secondary)",
        color: "#fff",
        margin: "8px 10px 6px 0",
        fontSize: "1rem",
        outline: revealed ? "2px solid var(--accent)" : undefined,
        cursor: revealed ? "default" : "pointer",
        minWidth: 120,
        border: "none",
        userSelect: "none",
        opacity: revealed ? 1 : 0.97
      }}
      type="button"
      disabled={revealed}
      onClick={onReveal}
      aria-label={revealed ? `Clue ${index + 1} revealed` : `Reveal clue ${index + 1}`}
    >
      {revealed ? (
        <span>
          <span style={{ background: "var(--secondary)", color: "#fff", marginRight: 6, borderRadius: 4, padding: "2px 8px" }}>
            Clue {index + 1}
          </span>
          {clue}
        </span>
      ) : (
        <>
          Show Clue {index + 1}
        </>
      )}
    </button>
  );
}

// PUBLIC_INTERFACE
export default function BlurredPosterQuiz() {
  const [questions, setQuestions] = useState(null); // [{movie}]
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  // Revealed clues array [bool, bool] per question
  const [revealedClues, setRevealedClues] = useState([false, false]);
  // revealed = if answer or reveal clicked (for this question)
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { setResults, setActiveGame } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveGame("Blurred Poster Quiz");
    async function load() {
      setLoading(true);
      // Limit: fetch first 40 movies and pick 10 random ones
      const { results = [] } = await getKollywoodMovies({ page: 1 });
      const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
      const sample = shuffle(results).slice(0, QUIZ_LENGTH);
      // Fetch more details for clues
      const questions = await Promise.all(
        sample.map(async (movie) => {
          const details = await getMovieDetails(movie.id);
          return { movie, details };
        })
      );
      setQuestions(questions);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Reset for each new question
    setRevealedClues([false, false]);
    setUserAnswer("");
    setFeedback(null);
    setRevealed(false);
  }, [index]);

  if (loading || !questions) {
    return <div style={{ padding: 48 }}>Loading quiz...</div>;
  }

  const curQ = questions[index];
  const posterUrl = getPosterUrl(curQ.movie);
  const correctTitle = curQ.movie.title || curQ.movie.original_title;

  // Clues
  const overviewEnglish = curQ.details.overview ? curQ.details.overview.split(".")[0] : null;
  const clues = [
    overviewEnglish || "A popular Kollywood movie, released in Tamil cinema.",
    `Release Year: ${curQ.details.release_date?.slice(0, 4) || curQ.movie.release_date?.slice(0, 4) || "?"}`,
  ];

  function handleRevealClue(i) {
    setRevealedClues((prev) => {
      const arr = [...prev];
      arr[i] = true;
      return arr;
    });
  }

  function autoNext() {
    // Set small delay for user to see feedback before advancing
    setTimeout(() => {
      if (index + 1 >= QUIZ_LENGTH) {
        setResults({
          score,
          total: QUIZ_LENGTH,
          detail: "Blurred Poster Quiz completed!",
        });
        navigate("/results");
      } else {
        setIndex(index + 1);
      }
    }, 950);
  }

  function checkAnswer() {
    if (!userAnswer.trim()) return;
    if (
      userAnswer.trim().toLowerCase() === correctTitle.trim().toLowerCase()
    ) {
      setFeedback({ correct: true, message: "Correct! 🎉" });
      setScore((s) => s + 1);
    } else {
      setFeedback({ correct: false, message: `Nope! The correct answer was "${correctTitle}"` });
    }
    setRevealed(true);
    autoNext();
  }

  function handleReveal() {
    setFeedback({ correct: false, message: `The correct answer was "${correctTitle}"` });
    setRevealed(true);
    autoNext();
  }

  // Don't display the "Next" button; auto-advance is used.
  return (
    <div className="quiz-container">
      <h2 className="title" style={{ color: "var(--secondary)", marginTop: 42 }}>
        Blurred Poster Quiz
      </h2>
      <ProgressBar current={index + 1} total={QUIZ_LENGTH} />
      <BlurredImage src={posterUrl} alt="Movie Poster" revealed={revealed} />
      <div className="clues-area" style={{ display: "flex", gap: 12, marginTop: 10, marginBottom: 18 }}>
        {[0, 1].map(i =>
          <ClickableClueButton
            key={i}
            clue={clues[i]}
            index={i}
            revealed={revealedClues[i]}
            onReveal={() => handleRevealClue(i)}
          />
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkAnswer();
        }}
        style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <input
          className="answer-input"
          placeholder="Enter movie title"
          value={userAnswer}
          disabled={revealed}
          onChange={e => setUserAnswer(e.target.value)}
          style={{
            fontSize: 20,
            padding: 12,
            width: 320,
            borderRadius: 8,
            border: "1px solid var(--secondary)",
            marginBottom: 8,
            outline: "var(--secondary)",
            background: "#fff",
            color: "#1b1b23",
            textAlign: "center"
          }}
        />
        {feedback && <AnswerFeedback {...feedback} />}
        <div style={{ display: "flex", gap: 13, marginTop: 8 }}>
          <button
            className="btn"
            type="submit"
            disabled={revealed}
            style={{ background: "var(--secondary)" }}
          >
            Submit
          </button>
          <button
            className="btn"
            style={{
              background: revealed ? "var(--accent)" : "var(--secondary)",
              color: "#fff",
              marginTop: 14,
            }}
            type="button"
            disabled={revealed}
            onClick={handleReveal}
          >
            {revealed ? "Revealed" : "Reveal Answer"}
          </button>
        </div>
      </form>
    </div>
  );
}
