import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { encryptPassword } from "../auth";

export default function ConfirmPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirm: "",
  });
  const [touched, setTouched] = useState({
    password: false,
    confirm: false,
  });
  const [time, setTime] = useState("");

  useEffect(() => {
    const resetEmail = localStorage.getItem("cn_reset_email");
    if (!resetEmail) {
      alert("Invalid session. Please start the password reset process again.");
      navigate("/forgot-password");
    }
  }, [navigate]);

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

  function validatePassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(
      password
    );
  }

  function validateField(name, value, currentForm) {
    let message = "";

    if (name === "password") {
      if (!value) message = "Password is required.";
      else if (!validatePassword(value))
        message =
          "Min 8 chars, with uppercase, lowercase, digit, and special char.";
    }

    if (name === "confirm") {
      if (!value) message = "Please confirm your password.";
      else if (value !== currentForm.password)
        message = "Passwords do not match.";
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    validateField(name, value, updated);
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, form[name], form);
  }

  const isFormValid =
    Object.values(errors).every((msg) => msg === "") &&
    Object.values(form).every((val) => val !== "");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isFormValid) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    const resetEmail = localStorage.getItem("cn_reset_email");
    if (!resetEmail) {
      alert("Invalid session. Please start over.");
      navigate("/forgot-password");
      return;
    }

    const hashedPassword = await encryptPassword(form.password);

    const users = JSON.parse(localStorage.getItem("cn_users") || "[]");
    const userIndex = users.findIndex((u) => u.email === resetEmail);

    if (userIndex === -1) {
      alert("User not found. Please try again.");
      navigate("/forgot-password");
      return;
    }

    users[userIndex].password = hashedPassword;
    localStorage.setItem("cn_users", JSON.stringify(users));

    localStorage.removeItem("cn_reset_email");

    navigate("/reset-success");
  }

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

        <div className="auth-title">Almost there!</div>

        <p
          style={{
            fontSize: "13px",
            color: "#3b2c2c",
            textAlign: "center",
            marginBottom: "16px",
            paddingInline: "10px",
          }}
        >
          You've been verified. Set a new password for your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <div className="auth-label">New password</div>
            <input
              className={`auth-input ${
                touched.password
                  ? errors.password
                    ? "input-error"
                    : "input-success"
                  : ""
              }`}
              type="password"
              name="password"
              placeholder="Enter new password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.password && errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div>
            <div className="auth-label">Confirm password</div>
            <input
              className={`auth-input ${
                touched.confirm
                  ? errors.confirm
                    ? "input-error"
                    : "input-success"
                  : ""
              }`}
              type="password"
              name="confirm"
              placeholder="Re-enter new password"
              value={form.confirm}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.confirm && errors.confirm && (
              <div className="field-error">{errors.confirm}</div>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={!isFormValid}
          >
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
