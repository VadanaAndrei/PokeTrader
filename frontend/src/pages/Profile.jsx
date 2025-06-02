import { useEffect, useState } from "react";
import api from "../api";
import "./../styles/Profile.css";

function Profile() {
  const [username, setUsername] = useState("");
  const [coins, setCoins] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [completedTrades, setCompletedTrades] = useState([]);
  const [ratedTrades, setRatedTrades] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/profile/");
        setUsername(res.data.username);
        setCoins(res.data.coins);
        setAverageRating(res.data.average_rating);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    const fetchCompletedTrades = async () => {
      try {
        const res = await api.get("/api/trades/completed/");
        setCompletedTrades(res.data);
      } catch (err) {
        console.error("Error loading completed trades:", err);
      }
    };

    const fetchRatedTrades = async () => {
      try {
        const res = await api.get("/api/trades/my-ratings/");
        setRatedTrades(res.data);
      } catch (err) {
        console.error("Error loading rated trades:", err);
      }
    };

    fetchProfile();
    fetchCompletedTrades();
    fetchRatedTrades();
  }, []);

  const calculateValue = (items) =>
    items.reduce((sum, item) => sum + item.quantity * (item.market_price || 0), 0);

  const handleRate = async (tradeId, rating) => {
    try {
      await api.post("/api/trades/rate/", {
        trade: tradeId,
        rating: rating,
      });
      setRatedTrades((prev) => ({ ...prev, [tradeId]: rating }));
    } catch (err) {
      console.error("Rating failed", err);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">👤 Profile</h2>
        <p className="welcome">
          Welcome, <strong>{username}</strong>!
        </p>

        <div className="coinBadge">
          <span className="coinEmoji">🪙</span>
          <span className="coinText">{coins} PokeCoins</span>
        </div>

        {averageRating !== null ? (
          <p style={{ marginTop: "1rem", fontWeight: "bold", color: "#444" }}>
            ⭐ Average Rating: {averageRating.toFixed(1)} / 5
          </p>
        ) : (
          <p style={{ marginTop: "1rem", fontWeight: "bold", color: "#888" }}>
            ⭐ You don’t have any ratings yet.
          </p>
        )}
      </div>

      {completedTrades.length > 0 && (
        <div className="tradeContainer">
          <h3 className="tradeTitle">Completed Trades</h3>
          {completedTrades.map((trade) => {
            const offeredValue = calculateValue(trade.offered_items_snapshot);
            const requestedValue = calculateValue(trade.requested_items_snapshot);

            return (
              <div
                key={trade.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "1.5rem",
                  marginBottom: "2rem",
                  width: "100%",
                  maxWidth: "800px",
                }}
              >
                <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                  Between: {trade.user} and {trade.accepted_by}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "bold" }}>Offered:</p>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      {trade.offered_items_snapshot.map((item, i) => (
                        <div key={i} style={{ width: "100px", textAlign: "center" }}>
                          <img src={item.image_url} alt={item.name} style={{ width: "100%", borderRadius: "8px" }} />
                          <p style={{ fontSize: "0.85rem", margin: "0.2rem 0" }}>{item.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "#777" }}>
                            {item.set_name}, #{item.number}
                          </p>
                          <p style={{ fontSize: "0.75rem" }}>x{item.quantity}</p>
                        </div>
                      ))}
                      {trade.offered_coins > 0 && (
                        <div className="coinBox">
                          💰<div>{trade.offered_coins} Coins</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "bold" }}>Received:</p>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      {trade.requested_items_snapshot.map((item, i) => (
                        <div key={i} style={{ width: "100px", textAlign: "center" }}>
                          <img src={item.image_url} alt={item.name} style={{ width: "100%", borderRadius: "8px" }} />
                          <p style={{ fontSize: "0.85rem", margin: "0.2rem 0" }}>{item.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "#777" }}>
                            {item.set_name}, #{item.number}
                          </p>
                          <p style={{ fontSize: "0.75rem" }}>x{item.quantity}</p>
                        </div>
                      ))}
                      {trade.requested_coins > 0 && (
                        <div className="coinBox">
                          💰<div>{trade.requested_coins} Coins</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <p><strong>Offered Value:</strong> ${offeredValue.toFixed(2)}</p>
                  <p><strong>Received Value:</strong> ${requestedValue.toFixed(2)}</p>
                </div>

                {!ratedTrades[trade.id] ? (
                  <div style={{ marginTop: "1rem" }}>
                    <p><strong>Rate this trade:</strong></p>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(trade.id, star)}
                        style={{
                          marginRight: "0.4rem",
                          padding: "0.4rem 0.8rem",
                          backgroundColor: "#fdd835",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ marginTop: "1rem" }}>⭐ You rated this trade: {ratedTrades[trade.id]} / 5</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Profile;
