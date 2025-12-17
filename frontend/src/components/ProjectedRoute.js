// src/components/ProtectedLayout.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import UserMenu from "./UserMenu";

const ProtectedLayout = () => {
  const { user, token } = useSelector((state) => state.auth);

  // Instant redirect if not authenticated
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header with only UserMenu Icon */}
      <header
        style={{
          backgroundColor: "#fff",
          padding: "16px 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <UserMenu /> {/* Now only shows icon */}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <Outlet /> {/* Renders EmployeeDashboard, Admin, etc. */}
      </main>
    </div>
  );
};

export default ProtectedLayout;