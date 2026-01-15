// Вставляешь сюда: frontend/src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => setOpen(!open);

  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2>StudyCore</h2>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {open ? "⮜" : "⮞"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <Link to="/menu" className="nav-link">Главное меню</Link>
        <Link to="/profile" className="nav-link">Профиль</Link>
        <Link to="/homework" className="nav-link">ДЗ</Link>
        <Link to="/journal" className="nav-link">Журнал</Link>
        <Link to="/ai" className="nav-link">ИИ</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
