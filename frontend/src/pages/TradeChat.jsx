import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from "../api";

function TradeChat() {
  const { tradeId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/trades/${tradeId}/messages/`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/api/trades/${tradeId}/confirmation/`);
        const { poster_confirmed, accepter_confirmed, user_is_poster } = res.data;

        if ((user_is_poster && poster_confirmed) || (!user_is_poster && accepter_confirmed)) {
          setConfirmed(true);
        }

        if (poster_confirmed && accepter_confirmed) {
          setConfirmMessage("Trade confirmed by both users!");
        } else if (
          (user_is_poster && poster_confirmed) ||
          (!user_is_poster && accepter_confirmed)
        ) {
          setConfirmMessage("Waiting for the other user to confirm...");
        }
      } catch (err) {
        console.error("Failed to fetch confirmation status", err);
      }
    };

    fetchMessages();
    fetchStatus();
  }, [tradeId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await api.post(`/api/trades/${tradeId}/messages/`, { text });
      setText("");
      const res = await api.get(`/api/trades/${tradeId}/messages/`);
      setMessages(res.data);
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
    <div style={{ padding: "2rem" }}>
      <h2>Trade Chat</h2>

      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "1rem" }}>
        {messages.map((msg) => (
          <p key={msg.id}>
            <strong>{msg.sender_username}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={handleConfirmTrade}
          disabled={confirmed}
          style={{
            backgroundColor: confirmed ? "#9ca3af" : "#22c55e",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            cursor: confirmed ? "not-allowed" : "pointer"
          }}
        >
          {confirmed ? "Confirmed" : "Confirm Trade"}
        </button>
        {confirmMessage && (
          <p style={{ marginTop: "1rem", fontWeight: "bold", color: "#16a34a" }}>
            {confirmMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default TradeChat;
