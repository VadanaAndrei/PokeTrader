import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

function Profile() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
    }
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Profile</h2>
      <p>Welcome, <strong>{username}</strong>!</p>
    </div>
  );
}

export default Profile;
