import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Menu from "../pages/Menu.jsx";
import Profile from "../pages/Profile.jsx";
import Homework from "../pages/Homework.jsx";
import Journal from "../pages/Journal.jsx";
import AI from "../pages/AI.jsx";
import Sidebar from "../components/Sidebar.jsx";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        {/* Routes with Sidebar */}
        <Route path="/menu" element={<><Sidebar /><Menu /></>} />
        <Route path="/profile" element={<><Sidebar /><Profile /></>} />
        <Route path="/homework" element={<><Sidebar /><Homework /></>} />
        <Route path="/journal" element={<><Sidebar /><Journal /></>} />
        <Route path="/ai" element={<><Sidebar /><AI /></>} />
        
        {/* Catch all other routes and redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
