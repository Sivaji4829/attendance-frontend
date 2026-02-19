// src/App.jsx

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Attendance from "../pages/Attendance";

// --- Decode JWT ---
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on first load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
      } else {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    const decoded = decodeToken(data.token);
    setUser(decoded);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-vh-100 bg-light">
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main className={user ? "container py-3" : ""}>
          <Routes>
            {/* Public Route */}
            <Route
              path="/login"
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
            />

            {/* Private Routes */}
            <Route
              path="/"
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
            />

            <Route
              path="/students"
              element={user ? <Students user={user} /> : <Navigate to="/login" />}
            />

            <Route
              path="/attendance"
              element={user ? <Attendance user={user} /> : <Navigate to="/login" />}
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={user ? "/" : "/login"} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
