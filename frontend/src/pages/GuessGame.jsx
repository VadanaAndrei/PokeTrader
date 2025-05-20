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
        { type: "question", text: question },
        { type: "answer", text: res.data.answer },
        ...prev,
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
        { type: "guess", text: guess },
        { type: "result", text: res.data.message },
        ...prev,
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

  const groupMessages = () => {
    const groups = [];
    for (let i = 0; i < messages.length; i += 2) {
      groups.push([messages[i], messages[i + 1]]);
    }
    return groups;
  };

  return (
    <div style={styles.page}>
      <style>
        {`
        .button-theme {
          background-color: #e60012;
          color: white;
          border: none;
          padding: 0.6rem 1.4rem;
          border-radius: 10px;
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
          transform: scale(0.97);
        }
      `}
      </style>

      <div style={styles.card}>
        <h2 style={styles.title}>Guess the Pokémon</h2>

        {status !== "playing" && (
          <div style={styles.centered}>
            <button onClick={startGame} className="button-theme">
              Start Game
            </button>
          </div>
        )}

        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        {status === "playing" && (
          <>
            <div style={styles.inputGroup}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                placeholder="Ask a yes/no question..."
                style={styles.input}
              />
              <button onClick={askQuestion} className="button-theme">Ask</button>
            </div>

            <div style={styles.inputGroup}>
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                placeholder="Your guess..."
                style={styles.input}
              />
              <button onClick={submitGuess} className="button-theme">Guess</button>
            </div>
          </>
        )}

        {(status === "playing" || status === "won") && (
          <div style={styles.chat}>
            {groupMessages().map(([m1, m2], idx) => (
              <div key={idx} style={styles.row}>
                {[m1, m2].map((m, i) => {
                  if (!m) return null;
                  const style = {
                    ...styles.bubble,
                    backgroundColor:
                      m.type === "answer" ? "#d0ebff" :
                      m.type === "result" ? (m.text.toLowerCase().includes("incorrect") ? "#ffd6d6" : "#d3f9d8") :
                      m.type === "error" ? "#ffebeb" :
                      "#f1f3f5",
                    color:
                      m.type === "answer" ? "#084298" :
                      m.type === "result" && m.text.toLowerCase().includes("incorrect") ? "#a10000" :
                      m.type === "result" ? "#0a572d" :
                      "#333",
                    fontWeight:
                      m.type === "question" || m.type === "guess" ? "bold" : "normal"
                  };

                  const prefix =
                    m.type === "question" ? "You asked: " :
                    m.type === "guess" ? "You guessed: " :
                    m.type === "answer" ? "Answer: " :
                    "";

                  return (
                    <p key={i} style={style}>{prefix}{m.text}</p>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {status === "won" && (
          <p style={styles.winnerMsg}>
            🎉 You guessed the Pokémon correctly!
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "2rem",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "900px",
    width: "100%",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    textAlign: "center",
    fontWeight: "bold",
  },
  centered: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  inputGroup: {
    marginBottom: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 1rem",
    maxWidth: "500px",
    marginInline: "auto",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "0.5rem",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
  },
  chat: {
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    borderRadius: "12px",
    minHeight: "100px",
    marginTop: "1rem",
  },
  row: {
    display: "flex",
    gap: "1rem",
    marginBottom: "0.6rem",
    flexWrap: "wrap",
  },
  bubble: {
    padding: "0.6rem 1rem",
    borderRadius: "12px",
    maxWidth: "100%",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
  winnerMsg: {
    marginTop: "1.5rem",
    fontWeight: "bold",
    color: "green",
    fontSize: "1.2rem",
    textAlign: "center",
    animation: "pop 0.5s ease-out",
  },
};

export default GuessGame;
