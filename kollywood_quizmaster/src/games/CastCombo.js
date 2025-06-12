import React, { useEffect, useState } from "react";
import { getKollywoodMovies, getMovieCredits } from "../tmdbApi";
import { useApp } from "../context/AppContext";
import { ProgressBar, AnswerFeedback, RevealButton } from "../components/Shared";
import { useNavigate } from "react-router-dom";

const QUIZ_LENGTH = 7;

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// PUBLIC_INTERFACE
export default function CastCombo() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const { setResults, setActiveGame } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveGame("Cast Combo");
    async function load() {
      const { results } = await getKollywoodMovies({ page: 6 });
      const questionsArr = [];
      for (let i = 0; i < QUIZ_LENGTH; i++) {
        const movie = results[i];
        const credits = await getMovieCredits(movie.id);
        const mainCast = (credits.cast || []).slice(0, 6);
        // Choose 2 or 3 from main cast, or for odd-one-out 2+1 from other movie
        if (mainCast.length < 2) continue;
        let combo = shuffle(mainCast).slice(0, 2);
        // For every other Q, do odd-one-out challenge
        let actors, correct;
        if (i % 2 === 1 && results.length > QUIZ_LENGTH + 2) {
          const nextMovie = results[QUIZ_LENGTH + i];
          const nextCast = (await getMovieCredits(nextMovie.id)).cast || [];
          const oddActor = shuffle(nextCast)[0];
          actors = [
            ...combo.map(act => act.name),
            oddActor?.name || "Unknown"
          ];
          correct = oddActor?.name || "Unknown";
          actors = shuffle(actors);
          questionsArr.push({
            type: "odd", actors, correct
          });
        } else {
          actors = combo.map(act => act.name);
          correct = movie.title;
          questionsArr.push({
            type: "combo",
            actors,
            correct,
          });
        }
      }
      setQuestions(questionsArr);
    }
    load();
    // eslint-disable-next-line
  }, []);

  function checkAnswer() {
    if (!answer.trim()) return;
    const curQ = questions[index];
    if (
      (curQ.type === "combo" &&
        answer.trim().toLowerCase() === curQ.correct.trim().toLowerCase()) ||
      (curQ.type === "odd" &&
        answer.trim().toLowerCase() === curQ.correct.trim().toLowerCase())
    ) {
      setFeedback({ correct: true, message: "Correct! 🎉" });
      setScore((s) => s + 1);
    } else {
      setFeedback({ correct: false, message: "Nope! " + (curQ.type === "combo"
        ? `Answer: "${curQ.correct}"`
        : `Odd actor: "${curQ.correct}"`) });
    }
    setRevealed(true);
  }

  function handleReveal() {
    const curQ = questions[index];
    setFeedback({ correct: false, message: curQ.type === "combo"
      ? `Movie: "${curQ.correct}"`
      : `Odd actor: "${curQ.correct}"` });
    setRevealed(true);
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setResults({
        score,
        total: questions.length,
        detail: "Cast Combo quiz finished!",
      });
      navigate("/results");
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setRevealed(false);
    setFeedback(null);
  }

  if (!questions.length) {
    return <div style={{ padding: 44 }}>Loading Cast Combo quiz...</div>;
  }

  const curQ = questions[index];

  return (
    <div className="quiz-container">
      <h2 className="title" style={{ color: "var(--secondary)", marginTop: 42 }}>
        Cast Combo
      </h2>
      <ProgressBar current={index + 1} total={QUIZ_LENGTH} />
      <div className="subtitle" style={{ margin: 12 }}>
        {curQ.type === "combo"
          ? "Which movie starred these actors?"
          : "Who is the odd actor NOT in the same movie?"}
      </div>
      <div style={{ margin: "30px auto 20px auto" }}>
        {curQ.actors.map((actor, i) => (
          <span
            key={actor}
            style={{
              display: "inline-block",
              fontWeight: 600,
              fontSize: 20,
              background: "#f0f0ff",
              color: "#e63ec0",
              marginRight: 18,
              marginBottom: 8,
              borderRadius: 6,
              padding: "10px 16px",
              letterSpacing: 1.1
            }}
          >
            {actor}
          </span>
        ))}
      </div>
      <form
        style={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}
        onSubmit={e => {
          e.preventDefault();
          checkAnswer();
        }}
      >
        <input
          className="answer-input"
          style={{
            fontSize: 20,
            width: 320,
            padding: 11,
            borderRadius: 7,
            border: "1.5px solid var(--accent)",
            background: "#fff", color: "#0f3460", textAlign: "center"
          }}
          placeholder={curQ.type === "combo" ? "Enter movie title" : "Enter odd actor's name"}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={revealed}
        />
        {feedback && <AnswerFeedback {...feedback} />}
        <div style={{ display: "flex", gap: 10, marginTop: 13 }}>
          <button className="btn" type="submit" disabled={revealed} style={{background:"var(--secondary)",color:"#fff"}}>Submit</button>
          <RevealButton revealed={revealed} onClick={handleReveal} />
        </div>
      </form>
      <button
        disabled={!revealed}
        className="btn btn-large"
        style={{ marginTop: 24, background:"var(--accent)", color:"#fff"}}
        onClick={handleNext}
      >
        {index + 1 >= questions.length ? "Finish" : "Next"}
      </button>
    </div>
  );
}
