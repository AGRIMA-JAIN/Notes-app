// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotesPage from "./pages/NotesPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerificationCodePage from "./pages/VerificationCodePage";
import ConfirmPasswordPage from "./pages/ConfirmPasswordPage";
import SuccessPage from "./pages/SuccessPage";
import AdminPage from "./pages/AdminPage";
import { getCurrentUser, logout as authLogout } from "./auth";

function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/notes" />
            ) : (
              <Login onAuthSuccess={handleAuthSuccess} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate to="/notes" />
            ) : (
              <Signup onAuthSuccess={handleAuthSuccess} />
            )
          }
        />
        <Route path="/reset-success" element={<SuccessPage />} />
        <Route path="/admin" element={<AdminPage />} />

        <Route
          path="/notes"
          element={
            currentUser ? (
              <NotesPage user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
