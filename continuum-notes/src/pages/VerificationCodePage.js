// src/pages/VerificationCodePage.js
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";

export default function VerificationCodePage() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/confirm-password");
  };

  return (
    <div className="auth-screen">
      <div className="auth-phone">
        <div className="auth-title">Verify your identity</div>

        <p
          style={{
            fontSize: "13px",
            color: "#3b2c2c",
            textAlign: "center",
            marginBottom: "16px",
            paddingInline: "10px",
          }}
        >
          We&apos;ve sent a 6-digit code to your email. Enter it below to
          continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <div className="auth-label">Verification code</div>
            <input
              className="auth-input"
              type="text"
              maxLength={6}
              placeholder="••••••"
            />
          </div>

          <button type="submit" className="auth-btn-primary">
            Continue
          </button>
        </form>

        <div className="auth-small" style={{ marginTop: "18px" }}>
          Didn&apos;t receive it? <span className="auth-link">Resend code</span>
        </div>

        <div className="auth-small" style={{ marginTop: "6px" }}>
          <Link to="/login" className="auth-link">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
