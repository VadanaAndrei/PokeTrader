import {useEffect, useState} from "react";
import api from "../api";
import {useNavigate} from "react-router-dom";

function TradeForm() {
    const [collection, setCollection] = useState([]);
    const [offered, setOffered] = useState({});
    const [requested, setRequested] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await api.get("/api/collection/");
                const filtered = res.data.filter((card) => card.available_quantity > 0);
                setCollection(filtered);
            } catch (err) {
                console.error("Failed to fetch collection", err);
            }
        };
        fetchCollection();
    }, []);

    const updateOffered = (cardId, delta, maxQty) => {
        setOffered((prev) => {
            const newQty = Math.max(0, Math.min((prev[cardId] || 0) + delta, maxQty));
            return {...prev, [cardId]: newQty};
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
            setRequested((prev) => [...prev, {...card, quantity: 1, id: card.id}]);
        }
        setSearchResults([]);
        setSearchQuery("");
    };

    const updateRequestedQuantity = (cardId, delta) => {
        setRequested((prev) =>
            prev
                .map((item) =>
                    item.card_id === cardId
                        ? {...item, quantity: item.quantity + delta}
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

        if (offeredCards.length === 0) {
            alert("You must offer at least one card.");
            return;
        }

        if (requestedCards.length === 0) {
            alert("You must request at least one card.");
            return;
        }

        try {
            await api.post("/api/trades/", {
                offered_items: offeredCards,
                requested_items: requestedCards,
            });
            alert("Trade posted!");
            navigate("/trades");
        } catch (err) {
            console.error("Failed to create trade", err);
            alert("Failed to create trade");
        }
    };


    return (
        <div style={{padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh"}}>
            <h2>Create a Trade</h2>

            <h3>Your Offered Cards</h3>
            <div style={{display: "flex", flexWrap: "wrap", gap: "1rem"}}>
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
                            style={{width: "100%", borderRadius: "8px"}}
                        />
                        <p style={{margin: "0.5rem 0 0.2rem"}}>{card.name}</p>
                        <p style={{fontSize: "0.9rem", color: "#777", margin: "0"}}>{card.set_name}</p>
                        <p style={{fontSize: "0.85rem", margin: "0.3rem 0"}}>
                            Available: {card.available_quantity}
                        </p>
                        <div style={{display: "flex", justifyContent: "center", gap: "0.5rem"}}>
                            <button onClick={() => updateOffered(card.id, -1, card.available_quantity)}>-</button>
                            <span>{offered[card.id] || 0}</span>
                            <button onClick={() => updateOffered(card.id, 1, card.available_quantity)}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            <h3 style={{marginTop: "2rem"}}>Cards You Want</h3>
            <input
                type="text"
                placeholder="Search a card by name..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{width: "300px", padding: "0.5rem", marginBottom: "1rem"}}
            />

            <div style={{display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem"}}>
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
                        <img src={card.image_url} alt={card.name} style={{width: "100%"}}/>
                        <p style={{margin: "0.3rem 0 0"}}>{card.name}</p>
                        <p style={{fontSize: "0.8rem", color: "#777"}}>{card.set_name}</p>
                    </div>
                ))}
            </div>

            {requested.length > 0 && (
                <div style={{marginTop: "1rem"}}>
                    <h4>Selected Cards:</h4>
                    <div style={{display: "flex", flexWrap: "wrap", gap: "1rem"}}>
                        {requested.map((card) => (
                            <div
                                key={card.card_id}
                                style={{
                                    width: "160px",
                                    textAlign: "center",
                                    background: "#fff",
                                    padding: "0.5rem",
                                    borderRadius: "10px",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                }}
                            >
                                <img src={card.image_url} alt={card.name} style={{width: "100%"}}/>
                                <p style={{margin: "0.3rem 0 0"}}>{card.name}</p>
                                <p style={{fontSize: "0.8rem", color: "#777"}}>{card.set_name}</p>
                                <div style={{display: "flex", justifyContent: "center", gap: "0.5rem"}}>
                                    <button onClick={() => updateRequestedQuantity(card.card_id, -1)}>-</button>
                                    <span>{card.quantity}</span>
                                    <button onClick={() => updateRequestedQuantity(card.card_id, 1)}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                style={{marginTop: "2rem", padding: "0.5rem 1.2rem", borderRadius: "8px"}}
            >
                Post Trade
            </button>
        </div>
    );
}

export default TradeForm;
