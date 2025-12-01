import "./Auth.css";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyPassword, seedAdminUser } from "../auth";

const API_URL = "http://localhost:4000/api";

export default function Login({ onAuthSuccess }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const [time, setTime] = useState("");

  useEffect(() => {
    seedAdminUser();
  }, []);

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

  function validateField(name, value, currentForm) {
    let message = "";

    if (name === "email") {
      if (!value) message = "Email is required.";
      else if (!validateEmail(value)) message = "Use a valid Gmail address.";
    }

    if (name === "password") {
      if (!value) message = "Password is required.";
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
    Object.values(errors).every((m) => m === "") &&
    form.email !== "" &&
    form.password !== "";

  async function loginWithLocalStorage(email, password) {
    const existingUsers = JSON.parse(localStorage.getItem("cn_users") || "[]");

    const user = existingUsers.find((u) => u.email === email);

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return { success: false, message: "Invalid email or password" };
    }

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    localStorage.setItem("cn_token", "local_" + Date.now());
    localStorage.setItem("cn_currentUser", JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!isFormValid) {
      alert("Please fix the errors before signing in.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("cn_token", data.token);
      localStorage.setItem("cn_currentUser", JSON.stringify(data.user));

      if (onAuthSuccess) onAuthSuccess(data.user);

      navigate("/notes");
    } catch (err) {
      console.log("Backend unavailable, using localStorage");

      const result = await loginWithLocalStorage(form.email, form.password);

      if (!result.success) {
        alert(result.message);
        return;
      }

      if (onAuthSuccess) onAuthSuccess(result.user);

      alert("Signed in successfully! (Running in offline mode)");
      navigate("/notes");
    }
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

        <div className="auth-title">Continuum Notes</div>

        <form onSubmit={handleLogin}>
          <div>
            <div className="auth-label">Email</div>
            <input
              type="email"
              name="email"
              className={`auth-input ${
                touched.email
                  ? errors.email
                    ? "input-error"
                    : "input-success"
                  : ""
              }`}
              placeholder="Enter your Gmail"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.email && errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div>
            <div className="auth-label">Password</div>
            <input
              type="password"
              name="password"
              className={`auth-input ${
                touched.password
                  ? errors.password
                    ? "input-error"
                    : "input-success"
                  : ""
              }`}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.password && errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={!isFormValid}
          >
            Sign In
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <button className="auth-btn-outline" type="button">
          Sign in with Google
        </button>

        <div className="auth-small" style={{ marginTop: 14 }}>
          Don't have an account?{" "}
          <Link className="auth-link" to="/signup">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
