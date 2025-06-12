import React, { useEffect, useState } from "react";
import { getKollywoodMovies, getMovieDetails, getMovieCredits } from "../tmdbApi";
import { useApp } from "../context/AppContext";
import { ProgressBar, AnswerFeedback } from "../components/Shared";
import { useNavigate } from "react-router-dom";

const QUIZ_LENGTH = 8;

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Two clue extraction utility (actor+year, actress+year). Clues should be two distinct hints.
function getTwoCluesFromCriteria(criteria) {
  return [
    `Actor: ${criteria.actor} | Year: ${criteria.year}`,
    `Actress: ${criteria.actress} | Year: ${criteria.year}`
  ];
}

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
export default function SpinTheWheel() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [revealedClues, setRevealedClues] = useState([false, false]);

  const { setResults, setActiveGame } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveGame("Spin the Wheel");
    async function load() {
      const { results } = await getKollywoodMovies({ page: 5 });
      const movies = results.slice(0, QUIZ_LENGTH);
      const enriched = await Promise.all(
        movies.map(async (mv) => {
          const details = await getMovieDetails(mv.id);
          const credits = await getMovieCredits(mv.id);
          return {
            movie: mv,
            details,
            credits,
          };
        })
      );
      setQuestions(enriched);
      // Set initial criteria
      rollWheel(0, enriched);
    }
    // eslint-disable-next-line
    load();
  }, []);

  // Reset clues/answers for each new question
  useEffect(() => {
    setRevealedClues([false, false]);
    setAnswer("");
    setRevealed(false);
    setFeedback(null);
  }, [index]);

  function rollWheel(i = index, arr = questions) {
    setSpinning(true);
    setTimeout(() => {
      let q = arr[i];
      if (!q) q = arr[0];
      const year = q.details.release_date?.slice(0, 4);
      const castList = q.credits?.cast?.slice(0, 8) || [];
      setCriteria({
        actor: getRandomElement(castList)?.name || "Actor",
        actress: getRandomElement(castList)?.name || "Actress",
        year: year || "????",
        correct: q.movie.title,
      });
      setAnswer("");
      setRevealed(false);
      setFeedback(null);
      setRevealedClues([false, false]);
      setSpinning(false);
    }, 800);
  }

  function handleRevealClue(i) {
    setRevealedClues((prev) => {
      const arr = [...prev];
      arr[i] = true;
      return arr;
    });
  }

  function autoNext() {
    setTimeout(() => {
      if (index + 1 >= QUIZ_LENGTH) {
        setResults({
          score,
          total: QUIZ_LENGTH,
          detail: "Spin the Wheel Game complete!",
        });
        navigate("/results");
        return;
      }
      setIndex((i) => i + 1);
      rollWheel(index + 1);
    }, 950);
  }

  function checkAnswer() {
    if (!answer.trim()) return;
    if (answer.trim().toLowerCase() === criteria.correct.trim().toLowerCase()) {
      setFeedback({ correct: true, message: "Correct! 🎉" });
      setScore((s) => s + 1);
    } else {
      setFeedback({ correct: false, message: `Nope! Answer was "${criteria.correct}"` });
    }
    setRevealed(true);
    autoNext();
  }

  function handleReveal() {
    setFeedback({ correct: false, message: `The movie is: "${criteria.correct}"` });
    setRevealed(true);
    autoNext();
  }

  if (!questions.length || !criteria) {
    return <div style={{ padding: 44 }}>Loading game...</div>;
  }

  const clues = getTwoCluesFromCriteria(criteria);

  return (
    <div className="quiz-container">
      <h2 className="title" style={{ color: "var(--secondary)", marginTop: 42 }}>Spin the Wheel</h2>
      <ProgressBar current={index + 1} total={QUIZ_LENGTH} />
      <div className="subtitle" style={{marginBottom:16}}>Spin to get hints, then guess the movie title!</div>
      <div className="wheel-section">
        <div className={"wheel-hint " + (spinning ? "spinning" : "")}>
          <span style={{fontWeight:600, color:"#ff00c8"}}>Actor:</span> {criteria.actor}<br/>
          <span style={{fontWeight:600, color:"#0f3460"}}>Actress:</span> {criteria.actress}<br/>
          <span style={{fontWeight:600, color:"#00b894"}}>Year:</span> {criteria.year}
        </div>
        <button
          className="btn"
          style={{ margin:"14px 0",background:"var(--secondary)",color:"#fff"}}
          disabled={spinning}
          onClick={() => rollWheel(index)}
        >
          {spinning ? "Spinning..." : "Spin Wheel Again"}
        </button>
      </div>
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
        style={{marginTop:18,display:"flex",flexDirection:"column",alignItems:"center"}}
        onSubmit={e => { e.preventDefault(); checkAnswer(); }}>
        <input
          className="answer-input"
          style={{
            fontSize:20,
            width:280,
            padding:10,
            borderRadius:7,
            border:"1.5px solid var(--accent)",
            background:"#fff",color:"#0f3460"
          }}
          placeholder="Enter movie title"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={revealed}
        />
        {feedback && <AnswerFeedback {...feedback} />}
        <div style={{display:"flex",gap:10,marginTop:10}}>
          <button className="btn" type="submit" disabled={revealed} style={{background:"var(--secondary)",color:"#fff"}}>Submit</button>
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
