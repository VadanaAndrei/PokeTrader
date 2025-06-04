import { useState } from "react";
import api from "../api";
import "../styles/Form.css";

function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await api.post("/api/password-reset/", { email });
            setMessage("Check your email for a reset link.");
        } catch (err) {
            if (err.response?.data?.email) {
                setError(err.response.data.email[0]);
            } else {
                setError("Something went wrong.");
            }
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

            <h1>Forgot Password</h1>

            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
            />

            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
            </button>

            {message && <div className="form-message">{message}</div>}
            {error && <div className="form-error">{error}</div>}
        </form>
    );
}

export default ForgotPasswordForm;