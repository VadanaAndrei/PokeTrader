import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./../styles/Navbar.css";

function Navbar() {
    const [username, setUsername] = useState("");

    const updateUsername = () => {
        const token = localStorage.getItem("access");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsername(decoded.username || "");
            } catch (e) {
                console.error("Token decode failed", e);
                setUsername("");
            }
        } else {
            setUsername("");
        }
    };

    useEffect(() => {
        updateUsername();

        const interval = setInterval(updateUsername, 500);
        window.addEventListener("storage", updateUsername);

        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", updateUsername);
        };
    }, []);

    return (
        <div className="navbar-wrapper">
            <div className="navbar-left">
                {username ? (
                    <span>
                        Hello,{" "}
                        <Link to="/profile" className="username-link">
                            {username}
                        </Link>
                    </span>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>

            <div className="navbar-center-button"></div>

            <div className="navbar-right">
                <Link to="/">Home</Link>
                <Link to="/sets">Cards</Link>
                <Link to="/collection">Collection</Link>
                <Link to="/trades">Trades</Link>
                {username && <Link to="/logout">Logout</Link>}
            </div>
        </div>
    );
}

export default Navbar;