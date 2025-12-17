// src/components/UserMenu.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

const UserMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect to login when user logs out
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("refresh_token");
    setDropdownOpen(false);
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative" }}>
      {/* Only Avatar Icon */}
      <div
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          backgroundColor: "#667eea",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {user.email.charAt(0).toUpperCase()}
      </div>

      {/* Dropdown on click */}
      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9 }}
            onClick={() => setDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "60px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              minWidth: "220px",
              overflow: "hidden",
              zIndex: 10,
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #eee",
                fontSize: "14px",
                color: "#555",
              }}
            >
              Logged in as<br />
              <strong style={{ color: "#333", fontSize: "15px" }}>
                {user.email}
              </strong>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "14px 20px",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e74c3c",
                fontWeight: "500",
                fontSize: "15px",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fdf2f2")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;