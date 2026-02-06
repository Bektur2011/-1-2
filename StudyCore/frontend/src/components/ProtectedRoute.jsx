import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").trim().toLowerCase();
  const allowed = allowedRoles.map((r) => String(r).trim().toLowerCase());

  if (!allowed.includes(role)) {
    return <Navigate to="/menu" replace />;
  }

  return children;
};

export default ProtectedRoute;
