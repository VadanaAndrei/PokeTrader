import { useEffect, useState } from "react";
import api from "../api";

function AcceptedTrades() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await api.get("/api/trades/accepted/");
        setTrades(res.data);
      } catch (err) {
        console.error("Failed to fetch accepted trades", err);
      }
    };
    fetchTrades();
  }, []);

  const calculateValue = (items) =>
    items.reduce((sum, item) => sum + item.quantity * (item.market_price || 0), 0);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h1>Accepted Trades</h1>
      {trades.length === 0 ? (
        <p>No accepted trades yet.</p>
      ) : (
        trades.map((trade) => {
          const offeredValue = calculateValue(trade.offered_items);
          const requestedValue = calculateValue(trade.requested_items);

          return (
            <div
              key={trade.id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                background: "#fff",
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
                  <p style={{ marginTop: "0.5rem" }}>
                    <strong>Total Value:</strong> ${offeredValue.toFixed(2)}
                  </p>
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
                  <p style={{ marginTop: "0.5rem" }}>
                    <strong>Total Value:</strong> ${requestedValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AcceptedTrades;
