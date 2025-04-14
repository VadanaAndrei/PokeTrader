// src/components/SearchBar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: "center", marginBottom: "2rem" }}>
      <input
        type="text"
        placeholder="Search cards by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "0.5rem 1rem",
          width: "300px",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
    </form>
  );
}

export default SearchBar;
