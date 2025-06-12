import React, { useEffect, useState } from "react";
import { getKollywoodMovies, getMovieDetails, getMovieCredits } from "../tmdbApi";
import { useApp } from "../context/AppContext";
import { ProgressBar } from "../components/Shared";
import { useNavigate } from "react-router-dom";

const QUIZ_LENGTH = 8;

/**
 * For each question, randomly select a movie, pick a main character, present a shuffled list of character names
 * (with similar/famous names from other movies), and require user to match each character to its correct movie.
 */
export default function CharacterMovieMatch() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [choices, setChoices] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [draggedChar, setDraggedChar] = useState(null);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const navigate = useNavigate();
  const { setResults, setActiveGame } = useApp();

  useEffect(() => {
    setActiveGame("Character-Movie Match");
    async function loadQuestions() {
      // Fetch a set of movies and for each, pick a main character
      const { results = [] } = await getKollywoodMovies({ page: 2 });
      const picks = results.slice(0, QUIZ_LENGTH * 2);
      const questionArr = [];
      for (let i = 0; i < QUIZ_LENGTH; i++) {
        const movie = picks[i];
        const credits = await getMovieCredits(movie.id);
        const mainCast = credits.cast?.filter(c => c.known_for_department === "Acting") || [];
        if (mainCast.length === 0) continue;
        const character = mainCast[0]?.character || mainCast[1]?.character || "";
        if (!character) continue;
        questionArr.push({
          movie,
          character,
          altMovie: picks[QUIZ_LENGTH + i],  // for decoy
        });
      }
      setQuestions(questionArr.slice(0, QUIZ_LENGTH));
    }
    loadQuestions();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!questions.length) return;
    // Shuffle a mix of the correct and 2-3 decoy characters for list
    const curQ = questions[current];
    const choices = [
      { name: curQ.character, movieTitle: curQ.movie.title, isCorrect: true },
      { name: "Arun Kumar", movieTitle: "Mouna Ragam", isCorrect: false },
      { name: "Anand", movieTitle: "Anniyan", isCorrect: false },
      { name: "Rani", movieTitle: "Queen", isCorrect: false },
    ];
    setChoices(choices.sort(() => Math.random() - 0.5));
  }, [current, questions]);

  function handleDrop(mv, char) {
    setAnswer({ correct: mv.title === questions[current].movie.title && char.isCorrect });
    setMatched([...matched, char.name]);
    if (mv.title === questions[current].movie.title && char.isCorrect) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (current + 1 === QUIZ_LENGTH) {
        setResults({
          score: score + (mv.title === questions[current].movie.title && char.isCorrect ? 1 : 0),
          total: QUIZ_LENGTH,
          detail: "Character-Movie Match Completed!",
        });
        setFinished(true);
        navigate("/results");
      } else {
        setCurrent((i) => i + 1);
        setAnswer(null);
        setDraggedChar(null);
      }
    }, 1000);
  }

  if (!questions.length) {
    return <div style={{ padding: 44 }}>Generating character-match game...</div>;
  }
  const curQ = questions[current];

  return (
    <div className="quiz-container">
      <h2 className="title" style={{ color: "var(--secondary)", marginTop: 42 }}>Character–Movie Match</h2>
      <ProgressBar current={current + 1} total={QUIZ_LENGTH} />
      <div className="subtitle" style={{ margin: 20 }}>
        <strong>Drag and drop the character to the correct movie!</strong>
      </div>
      <div style={{ margin: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", minHeight: 160 }}>
        <div style={{ marginBottom: 18 }}>
          <span className="game-icon" style={{ fontSize: 38, background: "#1fdfb8", color: "#fff" }}>🎭</span>
          <span style={{ fontSize: 23, marginLeft: 14 }}>Movie: <strong>{curQ.movie.title}</strong></span>
        </div>
        <div className="choices-area" style={{ display: "flex", gap: 16 }}>
          {choices.map((char, idx) => (
            <div
              key={char.name}
              draggable
              onDragStart={() => setDraggedChar(char)}
              className={"char-choice" + (matched.includes(char.name) ? " matched" : "")}
              style={{
                padding: "14px 28px",
                background: "#fff",
                color: "#252222",
                border: "2px solid var(--secondary)",
                borderRadius: 7,
                fontSize: 18,
                cursor: matched.includes(char.name) ? "not-allowed" : "grab",
                opacity: matched.includes(char.name) ? 0.57 : 1,
                marginBottom: 4,
                userSelect: "none",
              }}
            >
              {char.name}
            </div>
          ))}
        </div>
        <div
          className="movie-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (!draggedChar || matched.includes(draggedChar.name)) return;
            handleDrop(curQ.movie, draggedChar);
          }}
          style={{
            minHeight: 48,
            marginTop: 50,
            background: "#f0f0ff88",
            border: "2px dashed var(--accent)",
            borderRadius: 10,
            fontSize: 21,
            padding: "18px 32px",
            color: "#0f3460",
          }}
        >
          Drop Character Here
        </div>
        {answer && (
          <div style={{
            margin: 22,
            fontWeight: 500,
            fontSize: 18,
            color: answer.correct ? "#28a745" : "#ee3838"
          }}>
            {answer.correct ? "Correct! 🎉" : "Incorrect!"}
          </div>
        )}
      </div>
    </div>
  );
}
