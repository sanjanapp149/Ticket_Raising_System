import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


const Login = () => {
  const [isRegister, setIsRegister] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginRes = await api.post("/auth/login/", {
        email: loginEmail,
        password: loginPassword,
      });

      const { access, refresh } = loginRes.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const meRes = await api.get("/auth/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const user = meRes.data;
      dispatch(setCredentials({ user, token: access }));

      navigate(user.is_staff ? "/admin" : "/employee");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!regEmail || !regPassword || !regConfirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Register new user
      const regRes = await api.post("/register/", {
        email: regEmail,
        password: regPassword,
      });

      // Auto-login after successful registration
      const loginRes = await api.post("/auth/login/", {
        email: regEmail,
        password: regPassword,
      });

      const { access, refresh } = loginRes.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const meRes = await api.get("/auth/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const user = meRes.data;
      dispatch(setCredentials({ user, token: access }));

      alert("Registration successful! Welcome!");
      navigate(user.is_staff ? "/admin" : "/employee");
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "#333",
            fontSize: "28px",
          }}
        >
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          {isRegister ? "Sign up to get started" : "Log in to your account"}
        </p>

        {error && (
          <p
            style={{
              color: "#e74c3c",
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "14px",
              background: "#fdf2f2",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {error}
          </p>
        )}

        {/* Login Form */}
        {!isRegister && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ marginBottom: "8px", display: "block", fontWeight: "500" }}>
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
                
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label style={{ marginBottom: "8px", display: "block", fontWeight: "500" }}>
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {isRegister && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ marginBottom: "8px", display: "block", fontWeight: "500" }}>
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
                placeholder="you@example.com"
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ marginBottom: "8px", display: "block", fontWeight: "500" }}>
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label style={{ marginBottom: "8px", display: "block", fontWeight: "500" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>
        )}

        {/* Toggle Link */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              fontSize: "15px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;