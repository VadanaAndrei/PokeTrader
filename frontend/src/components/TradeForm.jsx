import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function TradeForm() {
  const [collection, setCollection] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [offeredCoins, setOfferedCoins] = useState(0);
  const [requestedCoins, setRequestedCoins] = useState(0);
  const [offered, setOffered] = useState({});
  const [requested, setRequested] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const [collectionRes, profileRes] = await Promise.all([
          api.get("/api/collection/"),
          api.get("/api/profile/")
        ]);
        const filtered = collectionRes.data.filter((card) => card.available_quantity > 0);
        setCollection(filtered);
        setUserCoins(profileRes.data.coins);
      } catch (err) {
        console.error("Failed to fetch collection or profile", err);
      }
    };
    fetchCollection();
  }, []);

  const updateOffered = (cardId, delta, maxQty) => {
    setOffered((prev) => {
      const newQty = Math.max(0, Math.min((prev[cardId] || 0) + delta, maxQty));
      return { ...prev, [cardId]: newQty };
    });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      api
        .get(`/api/cards/?search=${encodeURIComponent(query)}`)
        .then((res) => setSearchResults(res.data))
        .catch((err) => console.error("Search error:", err));
    } else {
      setSearchResults([]);
    }
  };

  const handleAddRequested = (card) => {
    if (!requested.some((r) => r.card_id === card.card_id)) {
      setRequested((prev) => [...prev, { ...card, quantity: 1, id: card.id }]);
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const updateRequestedQuantity = (cardId, delta) => {
    setRequested((prev) =>
      prev
        .map((item) =>
          item.card_id === cardId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSubmit = async () => {
    const offeredCards = Object.entries(offered)
      .filter(([_, qty]) => qty > 0)
      .map(([cardId, qty]) => ({
        user_card: parseInt(cardId),
        quantity: qty,
      }));

    const requestedCards = requested
      .filter((r) => r.quantity > 0)
      .map((r) => ({
        card: r.id,
        quantity: r.quantity,
      }));

    if (offeredCards.length === 0 && offeredCoins === 0) {
      alert("You must offer at least one card or some coins.");
      return;
    }

    if (requestedCards.length === 0 && requestedCoins === 0) {
      alert("You must request at least one card or some coins.");
      return;
    }

    if (offeredCoins > userCoins) {
      alert("You cannot offer more coins than you have!");
      return;
    }

    try {
      await api.post("/api/trades/", {
        offered_items: offeredCards,
        requested_items: requestedCards,
        offered_coins: offeredCoins,
        requested_coins: requestedCoins,
      });
      alert("Trade posted!");
      navigate("/trades");
    } catch (err) {
      console.error("Failed to create trade", err);
      alert("Failed to create trade");
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h2>Create a Trade</h2>

      <h3>Your Offered Cards</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {collection.map((card) => (
          <div
            key={card.id}
            style={{
              width: "160px",
              textAlign: "center",
              background: "#fff",
              padding: "0.5rem",
              borderRadius: "10px",
              backgroundColor: "#f4f4f4"
            }}
          >
            <img
              src={card.image_url}
              alt={card.name}
              loading="lazy"
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <p style={{ margin: "0.5rem 0 0.2rem" }}>{card.name}</p>
            <p style={{ fontSize: "0.9rem", color: "#777", margin: "0" }}>{card.set_name}, #{card.number}</p>
            <p style={{ fontSize: "0.85rem", color: "#444", margin: "0.2rem 0" }}>Price: ${card.market_price?.toFixed(2)}</p>
            <p style={{ fontSize: "0.85rem", margin: "0.3rem 0" }}>
              Available: {card.available_quantity}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              <button onClick={() => updateOffered(card.id, -1, card.available_quantity)}>-</button>
              <span>{offered[card.id] || 0}</span>
              <button onClick={() => updateOffered(card.id, 1, card.available_quantity)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: "2rem" }}>Coins You Want to Offer</h3>
      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => setOfferedCoins(Math.max(0, offeredCoins - 1))}>-</button>
        <span style={{ margin: "0 1rem" }}>{offeredCoins} / {userCoins} coins</span>
        <button onClick={() => setOfferedCoins(Math.min(userCoins, offeredCoins + 1))}>+</button>
      </div>

      <h3>Cards You Want</h3>
      <input
        type="text"
        placeholder="Search a card by name..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ width: "300px", padding: "0.5rem", marginBottom: "1rem" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        {searchResults.map((card) => (
          <div
            key={card.card_id}
            onClick={() => handleAddRequested(card)}
            style={{
              cursor: "pointer",
              width: "160px",
              textAlign: "center",
              background: "#fff",
              padding: "0.5rem",
              borderRadius: "10px",
              backgroundColor: "#f4f4f4"
            }}
          >
            <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
            <p style={{ margin: "0.3rem 0 0" }}>{card.name}</p>
            <p style={{ fontSize: "0.8rem", color: "#777" }}>{card.set_name}, #{card.number}</p>
            <p style={{ fontSize: "0.8rem", color: "#444" }}>Price: ${card.market_price?.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {requested.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Selected Cards:</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {requested.map((card) => (
              <div
                key={card.card_id}
                style={{
                  width: "160px",
                  textAlign: "center",
                  padding: "0.5rem",
                  borderRadius: "10px",
                }}
              >
                <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
                <p style={{ margin: "0.3rem 0 0" }}>{card.name}</p>
                <p style={{ fontSize: "0.8rem", color: "#777" }}>{card.set_name}, #{card.number}</p>
                <p style={{ fontSize: "0.8rem", color: "#444" }}>Price: ${card.market_price?.toFixed(2)}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                  <button onClick={() => updateRequestedQuantity(card.card_id, -1)}>-</button>
                  <span>{card.quantity}</span>
                  <button onClick={() => updateRequestedQuantity(card.card_id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginTop: "2rem" }}>Coins You Want to Receive</h3>
      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => setRequestedCoins(Math.max(0, requestedCoins - 1))}>-</button>
        <span style={{ margin: "0 1rem" }}>{requestedCoins} coins</span>
        <button onClick={() => setRequestedCoins(requestedCoins + 1)}>+</button>
      </div>

      <button
        onClick={handleSubmit}
        style={{ marginTop: "2rem", padding: "0.5rem 1.2rem", borderRadius: "8px" }}
      >
        Post Trade
      </button>
    </div>
  );
}

export default TradeForm;
