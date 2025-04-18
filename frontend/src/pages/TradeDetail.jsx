import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";

function TradeDetail() {
    const {id: tradeId} = useParams();
    const [trade, setTrade] = useState(null);
    const [collection, setCollection] = useState({});
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
                const [tradeRes, collectionRes] = await Promise.all([
                    api.get(`/api/trades/${tradeId}/`),
                    api.get("/api/collection/")
                ]);

                setTrade(tradeRes.data);

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
            console.error(err);
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
                console.error(err);
            }
        }
    };

    const calculateValue = (items) =>
        items.reduce((sum, item) => sum + item.quantity * (item.market_price || 0), 0);

    const canAccept = trade?.requested_items.every(
        (item) => collection[item.card_id] >= item.quantity
    );

    if (!trade) {
        return <div style={{padding: "2rem"}}>{error || "Loading..."}</div>;
    }

    const isMyTrade = trade.user === currentUser;
    const offeredValue = calculateValue(trade.offered_items);
    const requestedValue = calculateValue(trade.requested_items);

    return (
        <div style={{padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh"}}>
            <h2>Trade Details</h2>
            <p><strong>Posted by:</strong> {trade.user}</p>

            <div style={{display: "flex", gap: "3rem", flexWrap: "wrap", marginTop: "1rem"}}>
                <div>
                    <p><strong>Offers:</strong></p>
                    <div style={{display: "flex", gap: "1rem", flexWrap: "wrap"}}>
                        {trade.offered_items.map((item, i) => (
                            <div key={i} style={{width: "120px", textAlign: "center"}}>
                                <img src={item.image_url} alt={item.name} style={{width: "100%"}}/>
                                <p>{item.name}</p>
                                <p>x{item.quantity}</p>
                            </div>
                        ))}
                    </div>
                    <p style={{marginTop: "0.5rem"}}>
                        <strong>Total Value:</strong> ${offeredValue.toFixed(2)}
                    </p>
                </div>

                <div>
                    <p><strong>Wants:</strong></p>
                    <div style={{display: "flex", gap: "1rem", flexWrap: "wrap"}}>
                        {trade.requested_items.map((item, i) => (
                            <div key={i} style={{width: "120px", textAlign: "center"}}>
                                <img src={item.image_url} alt={item.name} style={{width: "100%"}}/>
                                <p>{item.name}</p>
                                <p>x{item.quantity}</p>
                            </div>
                        ))}
                    </div>
                    <p style={{marginTop: "0.5rem"}}>
                        <strong>Total Value:</strong> ${requestedValue.toFixed(2)}
                    </p>
                </div>
            </div>

            {isMyTrade ? (
                <>
                    <p style={{marginTop: "2rem", color: "#2563eb", fontWeight: "bold"}}>
                        This trade was posted by you.
                    </p>
                    <button
                        onClick={handleDelete}
                        style={{
                            marginTop: "1rem",
                            padding: "0.6rem 1.2rem",
                            backgroundColor: "#ef4444",
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
                <p style={{marginTop: "2rem", color: "#dc2626", fontWeight: "bold"}}>
                    You don't have the required cards to accept this trade.
                </p>
            )}
        </div>
    );
}

export default TradeDetail;
