import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          padding: "1rem",
          minHeight: "100vh",
          backgroundImage: 'url("/background.png")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Tektur, sans-serif",
            fontSize: "3.5rem",
            color: "white",
            zIndex: 1,
            position: "relative",
            textAlign: "center",
            marginTop: "100px",
          }}
        >
          Welcome to PokeTrader!
        </h1>

        <p
          style={{
            fontFamily: "Tektur, sans-serif",
            fontSize: "1.3rem",
            color: "white",
            zIndex: 1,
            position: "relative",
            textAlign: "center",
            marginTop: "-25px",
          }}
        >
          Begin your journey and start trading right now!
        </p>

        <button
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontFamily: "Tektur, sans-serif",
            backgroundColor: "transparent",
            color: "white",
            border: "2px solid white",
            borderRadius: "30px",
            cursor: "pointer",
            transition: "0.3s",
            marginTop: "2rem",
          }}
          onClick={() => navigate("/collection/")}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "white";
            e.target.style.color = "black";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "white";
          }}
        >
          Start Trading
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#7FAD70",
          padding: "4rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "Tektur, sans-serif",
            fontSize: "2rem",
            color: "white",
            marginBottom: "1rem",
          }}
        >
          Don't have any cards yet?
        </h2>
        <p
          style={{
            fontFamily: "Tektur, sans-serif",
            color: "white",
            fontSize: "1.1rem",
            marginBottom: "2rem",
          }}
        >
          Earn some coins with the Pokémon Guess Game!
        </p>
        <button
          style={{
            padding: "0.7rem 1.4rem",
            fontSize: "1rem",
            fontFamily: "Tektur, sans-serif",
            backgroundColor: "white",
            color: "#7FAD70",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/guess-game")}
        >
          Go to Guess Game
        </button>
      </div>
    </>
  );
}

export default Home;
