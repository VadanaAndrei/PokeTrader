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
          <div
            key={trade.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1.5rem",
              borderRadius: "8px",
            }}
          >
            <p><strong>Posted by:</strong> {trade.user}</p>

            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <p><strong>Offers:</strong></p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {trade.offered_items.map((item, i) => (
                    <div key={i} style={{ width: "120px", textAlign: "center" }}>
                      <img src={item.image_url} alt={item.name} style={{ width: "100%" }} />
                      <p>{item.name}</p>
                      <p>x{item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p><strong>Wants:</strong></p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {trade.requested_items.map((item, i) => (
                    <div key={i} style={{ width: "120px", textAlign: "center" }}>
                      <img src={item.image_url} alt={item.name} style={{ width: "100%" }} />
                      <p>{item.name}</p>
                      <p>x{item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Trades;
