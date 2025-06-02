import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";

function TradeDetail() {
  const { id: tradeId } = useParams();
  const [trade, setTrade] = useState(null);
  const [collection, setCollection] = useState({});
  const [userCoins, setUserCoins] = useState(0);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded.username);
    }

    const fetchData = async () => {
      try {
        const [tradeRes, collectionRes, profileRes] = await Promise.all([
          api.get(`/api/trades/${tradeId}/`),
          api.get("/api/collection/"),
          api.get("/api/profile/")
        ]);

        setTrade(tradeRes.data);
        setUserCoins(profileRes.data.coins);

        const collectionMap = {};
        collectionRes.data.forEach((c) => {
          collectionMap[c.card_id] = c.available_quantity;
        });
        setCollection(collectionMap);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Could not load trade details.");
      }
    };

    fetchData();
  }, [tradeId]);

  const handleAccept = async () => {
    try {
      await api.post(`/api/trades/${tradeId}/accept/`);
      alert("Trade accepted!");
      navigate("/trades");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept trade");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      try {
        await api.delete(`/api/trades/${tradeId}/`);
        alert("Trade deleted.");
        navigate("/trades");
      } catch (err) {
        alert("Failed to delete trade");
      }
    }
  };

  const calculateValue = (items) =>
    items.reduce((sum, item) => sum + item.quantity * (item.market_price || 0), 0);

  const canAccept =
    trade?.requested_items.every((item) => collection[item.card_id] >= item.quantity) &&
    userCoins >= (trade?.requested_coins || 0);

  if (!trade) {
    return <div style={{ padding: "2rem" }}>{error || "Loading..."}</div>;
  }

  const isMyTrade = trade.user === currentUser;
  const offeredValue = calculateValue(trade.offered_items);
  const requestedValue = calculateValue(trade.requested_items);

  const renderCardInfo = (item) => (
    <>
      <p style={{ marginBottom: "0.1rem" }}>{item.name}</p>
      <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>
        {item.set_name}, #{item.number}
      </p>
      <p style={{ fontSize: "0.85rem", color: "#444", marginTop: 0 }}>
        Price: ${item.market_price?.toFixed(2) ?? "N/A"}
      </p>
      <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.3rem" }}>
        x{item.quantity}
      </p>
    </>
  );

  const renderSection = (title, items, coins, value) => (
    <div
      style={{
        flex: 1,
        minWidth: "300px",
        background: "white",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h3>{title}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ width: "120px", textAlign: "center" }}>
              <img
                src={item.image_url}
                alt={item.name}
                style={{ width: "100%", borderRadius: "6px" }}
              />
              {renderCardInfo(item)}
            </div>
          ))}

          {coins > 0 && (
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
              <div style={{ marginTop: "0.5rem" }}>{coins} PokeCoins</div>
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
        Total Value: ${value.toFixed(2)}
      </p>
    </div>
  );

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "1rem" }}>Trade Details</h2>
      <p>
        <strong>Posted by:</strong> {trade.user}
        {trade.poster_rating !== null ? (
          <span style={{ marginLeft: "0.5rem", fontWeight: "normal", color: "#666" }}>
            (⭐ {trade.poster_rating} / 5)
          </span>
        ) : (
          <span style={{ marginLeft: "0.5rem", fontStyle: "italic", color: "#999" }}>
            (no ratings yet)
          </span>
        )}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "1.5rem" }}>
        {renderSection("Offers", trade.offered_items, trade.offered_coins, offeredValue)}
        {renderSection("Wants", trade.requested_items, trade.requested_coins, requestedValue)}
      </div>

      {isMyTrade ? (
        <>
          <p style={{ marginTop: "2rem", color: "#2563eb", fontWeight: "bold" }}>
            This trade was posted by you.
          </p>
          <button
            onClick={handleDelete}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#e60012",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Delete Trade
          </button>
        </>
      ) : canAccept ? (
        <button
          style={{
            marginTop: "2rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={handleAccept}
        >
          Accept Trade
        </button>
      ) : (
        <p style={{ marginTop: "2rem", color: "#dc2626", fontWeight: "bold" }}>
          You don't have the required cards or enough PokeCoins to accept this trade.
        </p>
      )}
    </div>
  );
}

export default TradeDetail;
