import {useEffect, useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import api from "../api";

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
                    maxWidth: "1830px",
                    margin: "0 auto 2rem auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <h1 style={{margin: 0}}>Available Trades</h1>
                <div style={{display: "flex", gap: "1rem"}}>
                    <Link to="/posted-trades">
                        <button className="button-theme">Posted Trades</button>
                    </Link>
                    <Link to="/accepted-trades">
                        <button className="button-theme">Accepted Trades</button>
                    </Link>
                </div>
            </div>

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
                                backgroundColor: "#fff",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                padding: "1.5rem",
                                marginBottom: "2rem",
                                maxWidth: "900px",
                                marginLeft: "auto",
                                marginRight: "auto",
                            }}
                        >
                            <p style={{fontWeight: "bold", marginBottom: "1rem"}}>Posted by: {trade.user}</p>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "2rem",
                                flexWrap: "wrap"
                            }}>
                                <div style={{flex: 1}}>
                                    <p style={{fontWeight: "bold"}}>Offers:</p>
                                    <div style={{display: "flex", gap: "1rem", flexWrap: "wrap"}}>
                                        {trade.offered_items.map((item, i) => (
                                            <div key={i} style={{width: "120px", textAlign: "center"}}>
                                                <img src={item.image_url} alt={item.name}
                                                     style={{width: "100%", borderRadius: "8px"}}/>
                                                <p style={{marginBottom: "0.2rem"}}>{item.name}</p>
                                                <p style={{fontSize: "0.9rem", color: "#777", margin: "0.2rem 0"}}>
                                                    {item.set_name}, #{item.number}
                                                </p>
                                                <p style={{fontSize: "0.85rem", margin: "0.2rem 0"}}>
                                                    Price: ${item.market_price?.toFixed(2) ?? "N/A"}
                                                </p>
                                                <p>x{item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{flex: 1}}>
                                    <p style={{fontWeight: "bold"}}>Wants:</p>
                                    <div style={{display: "flex", gap: "1rem", flexWrap: "wrap"}}>
                                        {trade.requested_items.map((item, i) => (
                                            <div key={i} style={{width: "120px", textAlign: "center"}}>
                                                <img src={item.image_url} alt={item.name}
                                                     style={{width: "100%", borderRadius: "8px"}}/>
                                                <p style={{marginBottom: "0.2rem"}}>{item.name}</p>
                                                <p style={{fontSize: "0.9rem", color: "#777", margin: "0.2rem 0"}}>
                                                    {item.set_name}, #{item.number}
                                                </p>
                                                <p style={{fontSize: "0.85rem", margin: "0.2rem 0"}}>
                                                    Price: ${item.market_price?.toFixed(2) ?? "N/A"}
                                                </p>
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
                                marginTop: "1rem",
                            }}>
                                <div>
                                    <p><strong>Offered Cards Value:</strong> ${offeredValue.toFixed(2)}</p>
                                    <p><strong>Requested Cards Value:</strong> ${requestedValue.toFixed(2)}</p>
                                </div>

                                <button
                                    className="button-theme"
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
