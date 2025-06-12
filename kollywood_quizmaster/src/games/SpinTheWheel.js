import React, { useEffect, useState } from "react";
import { getKollywoodMovies, getMovieDetails, getMovieCredits } from "../tmdbApi";
import { useApp } from "../context/AppContext";
import { ProgressBar, Clue, AnswerFeedback, RevealButton } from "../components/Shared";
import { useNavigate } from "react-router-dom";

const QUIZ_LENGTH = 8;

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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
      setSpinning(false);
    }, 800);
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
  }

  function handleReveal() {
    setFeedback({ correct: false, message: `The movie is: "${criteria.correct}"` });
    setRevealed(true);
  }

  function handleNext() {
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
  }

  if (!questions.length || !criteria) {
    return <div style={{ padding: 44 }}>Loading game...</div>;
  }

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
          <RevealButton revealed={revealed} onClick={handleReveal} />
        </div>
      </form>
      <button
        disabled={!revealed}
        className="btn btn-large"
        style={{ marginTop: 25, background:"var(--accent)", color:"#fff"}}
        onClick={handleNext}
      >
        {index + 1 >= QUIZ_LENGTH ? "Finish" : "Next"}
      </button>
    </div>
  );
}
