import {useEffect, useState} from "react";
import api from "../api";
import {useNavigate} from "react-router-dom";

function Trades() {
    const [trades, setTrades] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const res = await api.get("/api/trades/");
                setTrades(res.data);
            } catch (err) {
                console.error("Failed to fetch trades", err);
            }
        };
        fetchTrades();
    }, []);

    const calculateValue = (items) =>
        items.reduce((sum, item) => sum + item.quantity * (item.market_price || 0), 0);

    return (
        <div style={{padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh"}}>
            <h1>Available Trades</h1>
            {trades.length === 0 ? (
                <p>No trades available yet.</p>
            ) : (
                trades.map((trade) => {
                    const offeredValue = calculateValue(trade.offered_items);
                    const requestedValue = calculateValue(trade.requested_items);

                    return (
                        <div
                            key={trade.id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                marginBottom: "1.5rem",
                                borderRadius: "8px",
                                background: "#fff",
                            }}
                        >
                            <p><strong>Posted by:</strong> {trade.user}</p>

                            <div style={{display: "flex", gap: "2rem", flexWrap: "wrap"}}>
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
                                </div>
                            </div>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "1rem"
                            }}>
                                <div>
                                    <p><strong>Offered Cards Value:</strong> ${offeredValue.toFixed(2)}</p>
                                    <p><strong>Requested Cards Value:</strong> ${requestedValue.toFixed(2)}</p>
                                </div>

                                <button
                                    style={{
                                        padding: "0.6rem 1.6rem",
                                        fontSize: "1rem",
                                        borderRadius: "8px",
                                        backgroundColor: "#FF0000",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => navigate(`/trades/${trade.id}`)}
                                >
                                    View Trade
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Trades;
