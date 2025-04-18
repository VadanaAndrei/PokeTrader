import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

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
          maxWidth: "1830px",
          margin: "0 auto 2rem auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>Available Trades</h1>
        <div style={{ display: "flex", gap: "1rem"}}>
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
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <p>
                <strong>Posted by:</strong> {trade.user}
              </p>

              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div>
                  <p>
                    <strong>Offers:</strong>
                  </p>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {trade.offered_items.map((item, i) => (
                      <div key={i} style={{ width: "120px", textAlign: "center" }}>
                        <img src={item.image_url} alt={item.name} style={{ width: "100%" }} />
                        <p>{item.name}</p>
                        <p>x{item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p>
                    <strong>Wants:</strong>
                  </p>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {trade.requested_items.map((item, i) => (
                      <div key={i} style={{ width: "120px", textAlign: "center" }}>
                        <img src={item.image_url} alt={item.name} style={{ width: "100%" }} />
                        <p>{item.name}</p>
                        <p>x{item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1rem",
                }}
              >
                <div>
                  <p>
                    <strong>Offered Cards Value:</strong> ${offeredValue.toFixed(2)}
                  </p>
                  <p>
                    <strong>Requested Cards Value:</strong> ${requestedValue.toFixed(2)}
                  </p>
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
