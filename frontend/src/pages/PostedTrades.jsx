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

  const sortedTrades = [...trades].sort((a, b) => {
    if (a.accepted_by && !b.accepted_by) return -1;
    if (!a.accepted_by && b.accepted_by) return 1;
    return 0;
  });

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "2rem" }}>Posted Trades</h1>
      {sortedTrades.length === 0 ? (
        <p>You haven't posted any trades yet.</p>
      ) : (
        sortedTrades.map((trade) => {
          const offeredValue = calculateValue(trade.offered_items);
          const requestedValue = calculateValue(trade.requested_items);

          return (
            <div
              key={trade.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "1.5rem",
                marginBottom: "2rem",
                maxWidth: "900px",
                marginLeft: "auto",
                marginRight: "auto",
                position: "relative",
              }}
            >
              {trade.accepted_by && (
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  backgroundColor: "#22C55E",
                  color: "white",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "0.85rem"
                }}>
                  Accepted
                </div>
              )}

              <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>Posted by: {trade.user}</p>
              {trade.accepted_by && (
                <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>Accepted by: {trade.accepted_by}</p>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "bold" }}>Offers:</p>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {trade.offered_items.map((item, i) => (
                      <div key={i} style={{ width: "120px", textAlign: "center" }}>
                        <img src={item.image_url} alt={item.name} style={{ width: "100%", borderRadius: "8px" }} />
                        <p style={{ marginBottom: "0.2rem" }}>{item.name}</p>
                        <p style={{ fontSize: "0.9rem", color: "#777", margin: "0.2rem 0" }}>
                          {item.set_name}, #{item.number}
                        </p>
                        <p style={{ fontSize: "0.85rem", margin: "0.2rem 0" }}>
                          Price: ${item.market_price?.toFixed(2) ?? "N/A"}
                        </p>
                        <p>x{item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: "1rem" }}>
                    <strong>Total Value:</strong> ${offeredValue.toFixed(2)}
                  </p>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "bold" }}>Wants:</p>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {trade.requested_items.map((item, i) => (
                      <div key={i} style={{ width: "120px", textAlign: "center" }}>
                        <img src={item.image_url} alt={item.name} style={{ width: "100%", borderRadius: "8px" }} />
                        <p style={{ marginBottom: "0.2rem" }}>{item.name}</p>
                        <p style={{ fontSize: "0.9rem", color: "#777", margin: "0.2rem 0" }}>
                          {item.set_name}, #{item.number}
                        </p>
                        <p style={{ fontSize: "0.85rem", margin: "0.2rem 0" }}>
                          Price: ${item.market_price?.toFixed(2) ?? "N/A"}
                        </p>
                        <p>x{item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: "1rem" }}>
                    <strong>Total Value:</strong> ${requestedValue.toFixed(2)}
                  </p>
                </div>
              </div>

              {trade.accepted_by && (
                <Link to={`/trades/${trade.id}/chat`}>
                  <button
                    style={{
                      marginTop: "1.5rem",
                      padding: "0.6rem 1.2rem",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#e60012",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Go to Chat
                  </button>
                </Link>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default PostedTrades;
