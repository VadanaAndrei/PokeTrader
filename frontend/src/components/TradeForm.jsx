import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function TradeForm() {
  const [myCards, setMyCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [offered, setOffered] = useState([]);
  const [requested, setRequested] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      const res = await api.get("/api/collection/");
      setMyCards(res.data);
    };
    fetchCards();
  }, []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length > 1) {
      const res = await api.get(`/api/cards/?search=${term}`);
      setSearchResults(res.data);
    } else {
      setSearchResults([]);
    }
  };

  const toggle = (id, list, setList) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/trades/", {
        offered_cards: offered,
        requested_cards: requested,
      });
      setSuccessMsg("✅ Trade posted successfully!");
      setTimeout(() => navigate("/trades"), 1500);
    } catch (err) {
      console.error("Failed to create trade", err);
      alert("Error: Trade creation failed. Check the console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
      <h2>Create a Trade</h2>

      {successMsg && (
        <p style={{ color: "green", fontWeight: "bold", marginBottom: "1rem" }}>
          {successMsg}
        </p>
      )}

      <h3>Your Offered Cards</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {myCards.map((card) => (
          <label
            key={card.id}
            style={{
              border: offered.includes(card.id)
                ? "2px solid green"
                : "1px solid #ccc",
              borderRadius: "8px",
              padding: "0.5rem",
              width: "150px",
              textAlign: "center",
            }}
          >
            <input
              type="checkbox"
              checked={offered.includes(card.id)}
              onChange={() => toggle(card.id, offered, setOffered)}
            />
            <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
            <p>{card.name}</p>
            <p>x{card.quantity}</p>
          </label>
        ))}
      </div>

      <h3 style={{ marginTop: "2rem" }}>Cards You Want</h3>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search cards..."
        style={{
          padding: "0.5rem",
          width: "300px",
          marginBottom: "1rem",
          borderRadius: "8px",
        }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {searchResults.map((card) => (
          <label
            key={card.id}
            style={{
              border: requested.includes(card.id)
                ? "2px solid green"
                : "1px solid #ccc",
              borderRadius: "8px",
              padding: "0.5rem",
              width: "150px",
              textAlign: "center",
            }}
          >
            <input
              type="checkbox"
              checked={requested.includes(card.id)}
              onChange={() => toggle(card.id, requested, setRequested)}
            />
            <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
            <p>{card.name}</p>
          </label>
        ))}
      </div>

      <button type="submit" style={{ marginTop: "2rem" }}>Post Trade</button>
    </form>
  );
}

export default TradeForm;
