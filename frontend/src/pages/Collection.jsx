import { useEffect, useState } from "react";
import api from "../api";

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

  const handleAdd = async (cardId) => {
    try {
      await api.post("/api/collection/add/", { card_id: cardId });
      setCards((prev) =>
        prev.map((card) =>
          card.card_id === cardId
            ? { ...card, quantity: card.quantity + 1 }
            : card
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (cardId) => {
    const card = cards.find((c) => c.card_id === cardId);
    if (!card || card.quantity === 0) return;

    try {
      await api.post("/api/collection/remove/", { card_id: cardId });
      setCards((prev) =>
        prev
          .map((card) =>
            card.card_id === cardId
              ? { ...card, quantity: card.quantity - 1 }
              : card
          )
          .filter((card) => card.quantity > 0)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Collection</h2>
      {cards.length === 0 ? (
        <p>You don't have any cards yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {cards.map((card) => (
            <div key={card.card_id} style={{ width: "200px", textAlign: "center" }}>
              <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
              <p>{card.name}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <button onClick={() => handleRemove(card.card_id)}>-</button>
                <span>{card.quantity}</span>
                <button onClick={() => handleAdd(card.card_id)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Collection;
