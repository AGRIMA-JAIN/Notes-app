import "./Auth.css";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { encryptPassword } from "../auth";

const API_URL = "http://localhost:4000/api";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });
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

  function validatePassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(
      password
    );
  }

  function validateField(name, value, currentForm) {
    let message = "";

    if (name === "name") {
      if (!value.trim()) message = "Name is required.";
    }

    if (name === "email") {
      if (!value) message = "Email is required.";
      else if (!validateEmail(value))
        message = "Use a valid Gmail (example@gmail.com).";
    }

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

  async function saveUserToLocalStorage(user) {
    const existingUsers = JSON.parse(localStorage.getItem("cn_users") || "[]");

    const emailExists = existingUsers.some((u) => u.email === user.email);
    if (emailExists) {
      return { success: false, message: "Email already registered" };
    }

    existingUsers.push(user);
    localStorage.setItem("cn_users", JSON.stringify(existingUsers));

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    localStorage.setItem("cn_token", "local_" + Date.now());
    localStorage.setItem("cn_currentUser", JSON.stringify(userWithoutPassword));

    return { success: true };
  }

  async function handleSignup(e) {
    e.preventDefault();

    if (!isFormValid) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    const hashedPassword = await encryptPassword(form.password);

    const newUser = {
      id: Date.now().toString(),
      name: form.name,
      email: form.email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      localStorage.setItem("cn_token", data.token);
      localStorage.setItem("cn_currentUser", JSON.stringify(data.user));

      alert("Account created successfully!");
      navigate("/notes");
    } catch (err) {
      console.log("Backend unavailable, using localStorage");

      const result = await saveUserToLocalStorage(newUser);

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert("Account created successfully! (Running in offline mode)");
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

        <div className="auth-title">Create Account</div>

        <form onSubmit={handleSignup}>
          <div>
            <div className="auth-label">Name</div>
            <input
              type="text"
              name="name"
              className={`auth-input ${
                touched.name
                  ? errors.name
                    ? "input-error"
                    : "input-success"
                  : ""
              }`}
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.name && errors.name && (
              <div className="field-error">{errors.name}</div>
            )}
          </div>
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
              placeholder="Enter email (must be Gmail)"
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
              placeholder="Enter password"
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
            <div className="auth-label">Confirm Password</div>
            <input
              type="password"
              name="confirm"
              className={`auth-input ${
                touched.confirm
                  ? errors.confirm
                    ? "input-error"
                    : "input-success"
                  : ""
              }`}
              placeholder="Confirm password"
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
            Create Account
          </button>
        </form>

        <div className="auth-small" style={{ marginTop: 14 }}>
          Already have an account?{" "}
          <Link className="auth-link" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
