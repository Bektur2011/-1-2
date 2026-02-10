import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Menu from "../pages/Menu.jsx";
import Profile from "../pages/Profile.jsx";
import Homework from "../pages/Homework.jsx";
import Journal from "../pages/Journal.jsx";
import Creator from "../pages/Creator.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { useAuth } from "../store/authStore";

const Router = () => {
  const user = useAuth((state) => state.user);
  const profile = useAuth((state) => state.profile);
  const loading = useAuth((state) => state.loading);

  return (
    <BrowserRouter>
      <Routes>
        {/* Root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={user ? <Navigate to="/menu" replace /> : <Login />} />
        
        {/* Routes with Sidebar */}
        <Route path="/menu" element={user ? <><Sidebar /><Menu /></> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <><Sidebar /><Profile /></> : <Navigate to="/login" replace />} />
        <Route path="/homework" element={user ? <><Sidebar /><Homework /></> : <Navigate to="/login" replace />} />
        <Route path="/journal" element={user ? <><Sidebar /><Journal /></> : <Navigate to="/login" replace />} />
        <Route
          path="/creator"
          element={
            <ProtectedRoute allowedRoles={["Creator"]} profile={profile}>
              <><Sidebar /><Creator /></>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all other routes and redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
