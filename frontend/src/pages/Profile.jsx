import { useEffect, useState } from "react";
import api from "../api";

function Profile() {
  const [username, setUsername] = useState("");
  const [coins, setCoins] = useState(0);

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

    fetchProfile();
  }, []);

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
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "90vh",
    background: "#f4f4f4",
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
};

export default Profile;
