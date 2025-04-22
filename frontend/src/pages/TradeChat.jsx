import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

function TradeChat() {
  const { tradeId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(payload.username);
    }

    const fetchData = async () => {
      try {
        const [msgRes, statusRes] = await Promise.all([
          api.get(`/api/trades/${tradeId}/messages/`),
          api.get(`/api/trades/${tradeId}/confirmation/`)
        ]);

        setMessages(msgRes.data);
        setTimeout(scrollToBottom, 100);

        const { poster_confirmed, accepter_confirmed, user_is_poster } = statusRes.data;

        if ((user_is_poster && poster_confirmed) || (!user_is_poster && accepter_confirmed)) {
          setConfirmed(true);
        }

        if (poster_confirmed && accepter_confirmed) {
          setConfirmMessage("Trade confirmed by both users!");
        } else if ((user_is_poster && poster_confirmed) || (!user_is_poster && accepter_confirmed)) {
          setConfirmMessage("Waiting for the other user to confirm...");
        }
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();
  }, [tradeId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await api.post(`/api/trades/${tradeId}/messages/`, { text });
      setText("");
      const res = await api.get(`/api/trades/${tradeId}/messages/`);
      setMessages(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleConfirmTrade = async () => {
    try {
      setConfirmed(true);
      setConfirmMessage("Waiting for the other user to confirm...");
      const res = await api.post(`/api/trades/${tradeId}/confirm/`);
      setConfirmMessage(res.data.message || "Trade confirmed!");

      if (res.data.confirmed) {
        setTimeout(() => {
          navigate("/collection");
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm trade");
      setConfirmed(false);
      setConfirmMessage("");
    }
  };

  return (
    <div style={{
      padding: "2rem",
      backgroundColor: "#f9f9f9",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "700px",
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        minHeight: "80vh"
      }}>
        <h2 style={{ marginBottom: "1rem" }}>Trade Chat</h2>
        <div style={{
          flex: "1 1 auto",
          height: "400px",
          overflowY: "auto",
          backgroundColor: "#f1f5f9",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender_username === currentUser ? "flex-end" : "flex-start",
                marginBottom: "0.5rem"
              }}
            >
              <div style={{
                backgroundColor: msg.sender_username === currentUser ? "#dcfce7" : "#e5e7eb",
                color: "#111",
                padding: "0.6rem 1rem",
                borderRadius: "16px",
                maxWidth: "70%",
                textAlign: "left",
                wordBreak: "break-word"
              }}>
                <strong>{msg.sender_username}</strong>
                <p style={{ margin: 0 }}>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              borderRadius: "20px",
              border: "1px solid #ccc"
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.6rem 1.2rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </div>
        <div>
          <button
            onClick={handleConfirmTrade}
            disabled={confirmed}
            style={{
              backgroundColor: confirmed ? "#9ca3af" : "#22c55e",
              color: "white",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              cursor: confirmed ? "not-allowed" : "pointer"
            }}
          >
            {confirmed ? "Confirmed" : "Confirm Trade"}
          </button>
          {confirmMessage && (
            <p style={{ marginTop: "0.5rem", fontWeight: "bold", color: "#22c55e" }}>
              {confirmMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradeChat;
