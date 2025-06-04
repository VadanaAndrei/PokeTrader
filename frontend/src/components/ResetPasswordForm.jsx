import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Form.css";

function ResetPasswordForm() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!token) {
            setError("Missing token.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/password-reset-confirm/", {
                token: token,
                password: password,
            });
            setMessage("Password reset successfully. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError("Invalid or expired token.");
            console.error(err);
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
                .form-message {
                    font-family: Tektur, sans-serif;
                    margin-top: 1rem;
                    color: green;
                }
                .form-error {
                    font-family: Tektur, sans-serif;
                    margin-top: 1rem;
                    color: red;
                }
                `}
            </style>

            <h1>Reset Password</h1>

            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
            />
            <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
            />

            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
            </button>

            {message && <div className="form-message">{message}</div>}
            {error && <div className="form-error">{error}</div>}
        </form>
    );
}

export default ResetPasswordForm;
