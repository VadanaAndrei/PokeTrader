import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery();
  const searchTerm = query.get("q");
  const [results, setResults] = useState([]);
  const [collection, setCollection] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/api/cards/?search=${encodeURIComponent(searchTerm)}`);
        setResults(res.data);
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

    if (searchTerm) {
      fetchResults();
      fetchCollection();
    }
  }, [searchTerm]);

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
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>Search Results for: "{searchTerm}"</h2>

      {results.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          No cards found matching your search.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          {results.map((card) => (
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
                <span>{collection[card.card_id] || 0}</span>
                <button onClick={() => handleAdd(card.card_id)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
