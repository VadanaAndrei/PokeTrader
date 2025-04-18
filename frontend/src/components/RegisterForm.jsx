import {useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../api";
import "../styles/Form.css";

function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/user/register/", {
                username,
                email,
                password,
            });
            navigate("/login");
        } catch (error) {
            alert("Registration failed.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <style>
                {`
          .form-button {
            background-color: #e60012;
            color: white;
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          .form-button:hover {
            background-color: #cc000f;
          }
        `}
            </style>

            <h1>Register</h1>

            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
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
            <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
            />

            <button className="form-button" type="submit">
                {loading ? "Registering..." : "Register"}
            </button>

            <p style={{marginTop: "1rem", fontFamily: "Tektur, sans-serif"}}>
                Already have an account?{" "}
                <a href="/login" style={{color: "#FF0000", textDecoration: "underline"}}>
                    Login here!
                </a>
            </p>
        </form>
    );
}

export default RegisterForm;
