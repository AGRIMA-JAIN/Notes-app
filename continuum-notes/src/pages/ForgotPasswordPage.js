import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(formatted);
    }

    updateTime();
    const interval = setInterval(updateTime, 30000);

    return () => clearInterval(interval);
  }, []);

  function validateEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("cn_users") || "[]");
    const userExists = users.some((u) => u.email === email);

    if (!userExists) {
      setError("No account found with this email.");
      return;
    }

    localStorage.setItem("cn_reset_email", email);
    navigate("/verify-code");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="auth-screen">
      <div className="auth-phone">
        <div className="auth-status-bar">
          <span>{time}</span>
          <span>📶 🔋</span>
        </div>

        <div className="auth-logo-circle">
          <div className="auth-logo-inner" />
        </div>

        <div className="auth-title">Forgot Password?</div>

        <p
          style={{
            fontSize: "13px",
            color: "#3b2c2c",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Enter your email below and we will send a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <div className="auth-label">Email</div>
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {error && <div className="field-error">{error}</div>}
          </div>

          <button type="submit" className="auth-btn-primary">
            Continue
          </button>
        </form>

        <div className="auth-small" style={{ marginTop: "18px" }}>
          <Link to="/login" className="auth-link">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
