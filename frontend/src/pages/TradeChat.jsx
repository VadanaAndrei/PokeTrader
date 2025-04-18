import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function TradeChat() {
  const { tradeId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await api.get(`/api/trades/${tradeId}/messages/`);
      setMessages(res.data);
    };
    fetchMessages();
  }, [tradeId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await api.post(`/api/trades/${tradeId}/messages/`, { text });
    setText("");
    const res = await api.get(`/api/trades/${tradeId}/messages/`);
    setMessages(res.data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Trade Chat</h2>
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "1rem" }}>
        {messages.map((msg) => (
          <p key={msg.id}><strong>{msg.sender_username}:</strong> {msg.text}</p>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default TradeChat;
