import React, { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import "./App.css";


const App = () => {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple");
      const data = await res.json();

      if (!data.results || data.response_code !== 0) {
        throw new Error("❌ No questions found.");
      }

      const formatted = data.results.map((q) => ({
        question: q.question,
        options: shuffle([...q.incorrect_answers, q.correct_answer]),
        answer: q.correct_answer,
      }));

      setQuestions(formatted);
      setIndex(0);
      setScore(0);
      setShowResult(false);
    } catch (err) {
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswer = (option) => {
    const isCorrect = option === questions[index].answer;

    if (isCorrect) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play();
      setScore((prev) => prev + 1);
    } else {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play();
    }

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((prev) => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 500);
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={darkMode ? "quiz-container dark" : "quiz-container light"}>
      <h1>📚 Quiz Game</h1>
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
      <audio ref={correctSoundRef} src="/quiz-game/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/quiz-game/sounds/wrong.mp3" preload="auto" />



      {loading && <h2 className="loading">⏳ Loading...</h2>}

      {error && (
        <>
          <h2 className="error">{error}</h2>
          <button onClick={fetchData} className="btn">🔁 Try Again</button>
        </>
      )}

      {!loading && !error && !showResult && (
        <>
          <h3 dangerouslySetInnerHTML={{
            __html: `${index + 1}. ${questions[index].question}`
          }} />
          <div className="options">
            {questions[index].options.map((opt, i) => (
              <button
                key={i}
                className="btn"
                onClick={() => handleAnswer(opt)}
                dangerouslySetInnerHTML={{ __html: opt }}
              />
            ))}
          </div>
        </>
      )}

      {!loading && !error && showResult && (
        <>
          {score >= 3 && <Confetti />}
          <h2>
            {score >= 3 ? "🎉 Great Job!" : "📋 Quiz Over"} <br />
            ✅ Your Score: {score} / {questions.length}
          </h2>
          <button onClick={fetchData} className="btn">🔁 Restart</button>
        </>
      )}
    </div>
  );
};

export default App;
