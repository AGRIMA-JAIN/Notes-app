import "./Auth.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SuccessPage() {
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

        <div className="auth-title">Congratulations!</div>

        <p
          style={{
            fontSize: "13px",
            color: "#3b2c2c",
            textAlign: "center",
            marginBottom: "18px",
            paddingInline: "10px",
          }}
        >
          Your password has been reset successfully. You can now sign in with
          your new password.
        </p>

        <Link to="/login">
          <button type="button" className="auth-btn-primary">
            Back to Sign In
          </button>
        </Link>
      </div>
    </div>
  );
}
