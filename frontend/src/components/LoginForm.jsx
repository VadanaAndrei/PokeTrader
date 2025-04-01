import {useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../api";
import {ACCESS_TOKEN, REFRESH_TOKEN} from "../constants";
import "../styles/Form.css";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/api/token/", {
                username: email,
                password: password,
            });

            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/");
        } catch (error) {
            alert("Login failed.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Login</h1>

            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />

            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />

            <button className="form-button" type="submit">
                {loading ? "Logging in..." : "Login"}
            </button>

            <p style={{marginTop: "1rem", fontFamily: "Tektur, sans-serif"}}>
                Don’t have an account?{" "}
                <a href="/register" style={{color: "#FF0000", textDecoration: "underline"}}>
                    Register here!
                </a>
            </p>
        </form>
    );
}

export default LoginForm;
