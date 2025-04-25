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
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Profile</h2>
      <p>Welcome, <strong>{username}</strong>!</p>
      <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        🪙 PokeCoins: <strong>{coins}</strong>
      </p>
    </div>
  );
}

export default Profile;
