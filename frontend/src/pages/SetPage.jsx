import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

function SetPage() {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const [collection, setCollection] = useState({});
  const setName = cards.length > 0 ? cards[0].set_name : id;

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get(`/api/sets/${id}/cards/`);
        setCards(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCollection = async () => {
      try {
        const res = await api.get("/api/collection/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        const mapping = {};
        res.data.forEach((item) => {
          mapping[item.card_id] = item.quantity;
        });
        setCollection(mapping);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCards();
    fetchCollection();
  }, [id]);

  const handleAdd = async (cardId) => {
    try {
      await api.post(
        "/api/collection/add/",
        { card_id: cardId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setCollection((prev) => ({
        ...prev,
        [cardId]: (prev[cardId] || 0) + 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (cardId) => {
    if (!collection[cardId]) return;

    try {
      await api.post(
        "/api/collection/remove/",
        { card_id: cardId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setCollection((prev) => ({
        ...prev,
        [cardId]: prev[cardId] - 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4" }}>
      <h2 style={{ textAlign: "center" }}>Cards in Set: {setName}</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        {cards.map((card) => (
          <div key={card.card_id} style={{ width: "200px", textAlign: "center" }}>
            <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
            <p>{card.name}</p>
            <p>
              Price:{" "}
              {card.market_price !== null
                ? `$${card.market_price.toFixed(2)}`
                : "N/A"}
            </p>
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
              <span>{collection[card.card_id] || 0}</span>
              <button onClick={() => handleAdd(card.card_id)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SetPage;
