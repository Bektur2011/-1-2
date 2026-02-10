import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, profile, children }) => {
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const role = String(profile.role || "").trim().toLowerCase();
  const allowed = allowedRoles.map((r) => String(r).trim().toLowerCase());

  if (!allowed.includes(role)) {
    return <Navigate to="/menu" replace />;
  }

  return children;
};

export default ProtectedRoute;
