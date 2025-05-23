import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

function Collection() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await api.get("/api/collection/");
        setCards(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCollection();
  }, []);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <style>
        {`
          .button-theme {
            background-color: #e60012;
            color: white;
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
          }
          .button-theme:hover {
            background-color: #cc000f;
            transform: translateY(-2px);
          }
          .button-theme:active {
            transform: scale(0.98);
          }
        `}
      </style>

      <div
        style={{
          maxWidth: "1450px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Your Collection</h2>
        <Link to="/trade-form">
          <button className="button-theme">Create Trade</button>
        </Link>
      </div>

      <p
        style={{
          fontSize: "1rem",
          color: "#333",
          marginTop: "0.5rem",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        Total Collection Value: $
        {cards.reduce((sum, card) => sum + (card.market_price || 0) * card.quantity, 0).toFixed(2)}
      </p>

      {cards.length === 0 ? (
        <p style={{ textAlign: "center" }}>You don't have any cards yet.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {cards.map((card) => {
            const upForTrade = card.quantity - card.available_quantity;
            const available = card.available_quantity;

            return (
              <div
                key={card.card_id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1rem",
                  alignItems: "flex-start",
                  width: "fit-content",
                }}
              >
                {upForTrade > 0 && (
                  <div style={{ textAlign: "center", position: "relative", width: "200px" }}>
                    <div style={{ filter: "blur(4px)" }}>
                      <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "rgba(255, 165, 0, 0.9)",
                        color: "white",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      Up for trade ({upForTrade})
                    </div>
                    <p>{card.name}</p>
                    <p style={{ fontSize: "0.9rem", color: "#777", marginTop: "-0.5rem" }}>
                      {card.set_name}, #{card.number}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#333", margin: "0.2rem 0" }}>
                      Price: ${card.market_price?.toFixed(2) ?? "N/A"}
                    </p>
                  </div>
                )}

                {available > 0 && (
                  <div style={{ textAlign: "center", position: "relative", width: "200px" }}>
                    <img
                      src={card.image_url}
                      alt={card.name}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "rgba(34, 197, 94, 0.9)",
                        color: "white",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      Available ({available})
                    </div>
                    <p>{card.name}</p>
                    <p style={{ fontSize: "0.9rem", color: "#777", marginTop: "-0.5rem" }}>
                      {card.set_name}, #{card.number}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#333", margin: "0.2rem 0" }}>
                      Price: ${card.market_price?.toFixed(2) ?? "N/A"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Collection;
