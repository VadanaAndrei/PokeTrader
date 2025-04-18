import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function PostedTrades() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchMyTrades = async () => {
      try {
        const res = await api.get("/api/trades/?posted_by_me=true");
        setTrades(res.data);
      } catch (err) {
        console.error("Failed to fetch posted trades", err);
      }
    };

    fetchMyTrades();
  }, []);

  const calculateValue = (items) =>
    items.reduce((sum, item) => sum + item.quantity * (item.market_price || 0), 0);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h2>Posted Trades</h2>
      {trades.length === 0 ? (
        <p>You haven't posted any trades yet.</p>
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
                marginBottom: "1rem",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <p><strong>Posted by:</strong> {trade.user}</p>
              {trade.accepted_by && (
                <p><strong>Accepted by:</strong> {trade.accepted_by}</p>
              )}

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
                  <p><strong>Total Value:</strong> ${offeredValue.toFixed(2)}</p>
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
                  <p><strong>Total Value:</strong> ${requestedValue.toFixed(2)}</p>
                </div>
              </div>

              {trade.accepted_by && (
                <div style={{ marginTop: "1rem" }}>
                  <Link to={`/trades/${trade.id}/chat`}>
                    <button style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      backgroundColor: "#22c55e",
                      color: "white",
                      border: "none"
                    }}>
                      Go to Chat
                    </button>
                  </Link>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default PostedTrades;
