import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Form.css";

function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match." });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.post("/api/user/register/", {
                username,
                email,
                password,
            });
            navigate("/login");
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ general: "Registration failed. Please try again." });
            }
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
                .error-message {
                    color: red;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
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
            {errors.username && <div className="error-message">{errors.username[0]}</div>}

            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            {errors.email && <div className="error-message">{errors.email[0]}</div>}

            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {errors.password && <div className="error-message">{errors.password[0]}</div>}

            <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
            />
            {errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
            )}

            {errors.general && <div className="error-message">{errors.general}</div>}

            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
            </button>

            <p style={{ marginTop: "1rem", fontFamily: "Tektur, sans-serif" }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: "#FF0000", textDecoration: "underline" }}>
                    Login here!
                </a>
            </p>
        </form>
    );
}

export default RegisterForm;
