import { useEffect, useState } from "react";
import api from "../api";

function Trades() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await api.get("/api/trades/");
        setTrades(res.data);
      } catch (err) {
        console.error("Failed to fetch trades", err);
      }
    };
    fetchTrades();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Available Trades</h1>
      {trades.length === 0 ? (
        <p>No trades available yet.</p>
      ) : (
        trades.map((trade) => (
          <div key={trade.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <p><strong>Posted by:</strong> {trade.user}</p>
            <p><strong>Offers:</strong></p>
            <ul>
              {trade.offered_cards.map((card, i) => (
                <li key={i}>
                  {card.name} x{card.quantity}
                </li>
              ))}
            </ul>
            <p><strong>Wants:</strong></p>
            <ul>
              {trade.requested_cards.map((card, i) => (
                <li key={i}>{card.name}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Trades;
