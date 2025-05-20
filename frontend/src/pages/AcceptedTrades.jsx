import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  const renderCoinsCard = (amount) => (
    <div
      style={{
        width: "120px",
        height: "170px",
        borderRadius: "8px",
        backgroundColor: "#fffbe6",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#d97706",
        fontWeight: "bold",
        fontSize: "1.2rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      💰
      <div style={{ marginTop: "0.5rem" }}>{amount} PokeCoins</div>
    </div>
  );

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "2rem" }}>Accepted Trades</h1>
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
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "1.5rem",
                marginBottom: "2rem",
                maxWidth: "900px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                Posted by: {trade.user}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "bold" }}>Offers:</p>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {trade.offered_items.map((item, i) => (
                      <div key={i} style={{ width: "120px", textAlign: "center" }}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ width: "100%", borderRadius: "8px" }}
                        />
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
                    {trade.offered_coins > 0 && renderCoinsCard(trade.offered_coins)}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "bold" }}>Wants:</p>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {trade.requested_items.map((item, i) => (
                      <div key={i} style={{ width: "120px", textAlign: "center" }}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ width: "100%", borderRadius: "8px" }}
                        />
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
                    {trade.requested_coins > 0 && renderCoinsCard(trade.requested_coins)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1rem",
                }}
              >
                <div>
                  <p>
                    <strong>Offered Cards Value:</strong> ${offeredValue.toFixed(2)}
                  </p>
                  <p>
                    <strong>Requested Cards Value:</strong> ${requestedValue.toFixed(2)}
                  </p>
                </div>

                <Link to={`/trades/${trade.id}/chat`}>
                  <button
                    style={{
                      padding: "0.6rem 1.2rem",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#e60012",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Go to chat
                  </button>
                </Link>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AcceptedTrades;
