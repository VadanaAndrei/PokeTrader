import { useEffect, useState } from "react";
import api from "../api";

function Profile() {
  const [username, setUsername] = useState("");
  const [coins, setCoins] = useState(0);
  const [completedTrades, setCompletedTrades] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/profile/");
        setUsername(res.data.username);
        setCoins(res.data.coins);
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

    fetchProfile();
    fetchCompletedTrades();
  }, []);

  const calculateValue = (items) =>
    items.reduce((sum, item) => sum + item.quantity * (item.market_price || 0), 0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>👤 Profile</h2>
        <p style={styles.welcome}>Welcome, <strong>{username}</strong>!</p>

        <div style={styles.coinBadge}>
          <span style={styles.coinEmoji}>🪙</span>
          <span style={styles.coinText}>{coins} PokeCoins</span>
        </div>
      </div>

      {completedTrades.length > 0 && (
        <div style={styles.tradeContainer}>
          <h3 style={styles.tradeTitle}>Completed Trades</h3>
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
                        <div style={styles.coinBox}>
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
                        <div style={styles.coinBox}>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem 3rem",
    borderRadius: "20px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    fontFamily: "'Segoe UI', sans-serif",
    marginBottom: "3rem",
  },
  title: {
    marginBottom: "0.5rem",
    fontSize: "2rem",
    color: "#e60000",
  },
  welcome: {
    fontSize: "1.2rem",
    marginBottom: "1.5rem",
  },
  coinBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    border: "2px solid #ffcd39",
    borderRadius: "30px",
    padding: "0.6rem 1.2rem",
    fontWeight: "bold",
    fontSize: "1.1rem",
    boxShadow: "inset 0 2px 4px rgba(255, 205, 57, 0.4)",
  },
  coinEmoji: {
    fontSize: "1.5rem",
    marginRight: "0.5rem",
  },
  coinText: {
    color: "#664d03",
  },
  tradeContainer: {
    width: "100%",
    maxWidth: "900px",
  },
  tradeTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#333",
  },
  coinBox: {
    width: "100px",
    height: "140px",
    borderRadius: "8px",
    backgroundColor: "#fffbe6",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#d97706",
    fontWeight: "bold",
    fontSize: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
};

export default Profile;
