import { useEffect, useState } from "react";
import api from "../api";

function PostedTrades() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchMyTrades = async () => {
      try {
        const res = await api.get("/api/trades/?posted_by_me=true");
        setTrades(res.data);
      } catch (err) {
        console.error("Failed to fetch posted trades", err);
      }
    };

    fetchMyTrades();
  }, []);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h2>Posted Trades</h2>
      {trades.length === 0 ? (
        <p>You haven't posted any trades yet.</p>
      ) : (
        trades.map((trade) => (
          <div key={trade.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <p><strong>Posted by:</strong> {trade.user}</p>
            {/* Poți adăuga aici și restul detaliilor: offered_items, requested_items etc. */}
          </div>
        ))
      )}
    </div>
  );
}

export default PostedTrades;
