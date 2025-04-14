import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar.jsx";

function Sets() {
  const [groupedSets, setGroupedSets] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await api.get("/api/sets/");
        const sortedSets = res.data.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date)
        );

        const groups = {};
        sortedSets.forEach((set) => {
          const series = set.series || "Other";
          if (!groups[series]) {
            groups[series] = [];
          }
          groups[series].push(set);
        });

        setGroupedSets(groups);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSets();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>All Pokémon Card Sets</h1>
      <SearchBar />

      {Object.entries(groupedSets).map(([series, sets]) => (
        <div key={series} style={{ marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>{series} Series</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {sets.map((set) => (
              <Link
                key={set.id}
                to={`/sets/${set.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    padding: "1rem",
                    height: "220px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1rem",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <img
                    src={set.logo_url}
                    alt={set.name}
                    style={{
                      width: "100%",
                      maxHeight: "120px",
                      objectFit: "contain",
                    }}
                  />
                  <h3 style={{ fontSize: "1.1rem", margin: 0, textAlign: "center" }}>
                    {set.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Sets;
