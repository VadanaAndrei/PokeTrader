import { useEffect, useState } from "react";
import api from "../api";

function GuessGame() {
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActiveGame = async () => {
      try {
        const res = await api.get("/api/active-game/");
        if (res.data.active) {
          setStatus("playing");
          const loadedMessages = res.data.messages.flatMap((msg) => {
            if (msg.is_guess) {
              return [
                { type: "guess", text: msg.text },
                { type: "result", text: msg.answer },
              ];
            } else {
              return [
                { type: "question", text: msg.text },
                { type: "answer", text: msg.answer },
              ];
            }
          });

          setMessages(loadedMessages.filter(Boolean));
        }
      } catch (err) {
        console.error("Error loading active game:", err);
      }
    };

    loadActiveGame();
  }, []);

  const startGame = async () => {
    try {
      await api.post("/api/start-game/");
      setMessages([]);
      setStatus("playing");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start game.");
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    try {
      const res = await api.post("/api/ask-question/", { question });
      setMessages((prev) => [
        ...prev,
        { type: "question", text: question },
        { type: "answer", text: res.data.answer },
      ]);
      setQuestion("");
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: "Could not process your question." },
      ]);
    }
  };

  const submitGuess = async () => {
    if (!guess.trim()) return;
    try {
      const res = await api.post("/api/guess/", { guess });
      setMessages((prev) => [
        ...prev,
        { type: "guess", text: guess },
        { type: "result", text: res.data.message },
      ]);
      setGuess("");
      if (res.data.correct) setStatus("won");
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: "Error submitting guess." },
      ]);
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <style>
        {`
          .button-theme {
            background-color: #e60012;
            color: white;
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
          }
          .button-theme:hover {
            background-color: #cc000f;
            transform: translateY(-2px);
          }
          .button-theme:active {
            transform: scale(0.98);
          }
        `}
      </style>

      <h2 style={{ marginBottom: "1rem" }}>Guess the Pokémon</h2>

      {status !== "playing" && (
        <button onClick={startGame} className="button-theme" style={{ marginBottom: "1rem" }}>
          Start Game
        </button>
      )}

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {status === "playing" && (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") askQuestion();
              }}
              placeholder="Ask a yes/no question..."
              style={{
                width: "100%",
                padding: "0.6rem",
                fontSize: "1rem",
                marginBottom: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <button onClick={askQuestion} className="button-theme">
              Ask
            </button>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitGuess();
              }}
              placeholder="Your guess..."
              style={{
                width: "100%",
                padding: "0.6rem",
                fontSize: "1rem",
                marginBottom: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <button onClick={submitGuess} className="button-theme">
              Guess
            </button>
          </div>
        </>
      )}

      <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px" }}>
        {messages.map((m, idx) => {
          let color = "#333";
          let prefix = "";

          if (m.type === "answer") {
            color = "blue";
            prefix = "Answer: ";
          } else if (m.type === "result") {
            if (m.text.toLowerCase().includes("incorrect")) {
              color = "red";
            } else {
              color = "green";
            }
          } else if (m.type === "error") {
            color = "red";
          }

          if (m.type === "question") {
            prefix = "You asked: ";
          } else if (m.type === "guess") {
            prefix = "You guessed: ";
          }

          return (
            <p
              key={idx}
              style={{
                margin: "0.5rem 0",
                color: color,
                fontWeight: m.type === "question" || m.type === "guess" ? "bold" : "normal",
              }}
            >
              {prefix}
              {m.text}
            </p>
          );
        })}
      </div>

      {status === "won" && (
        <p style={{ marginTop: "1rem", fontWeight: "bold", color: "green" }}>
          You guessed the Pokémon correctly!
        </p>
      )}
    </div>
  );
}

export default GuessGame;
