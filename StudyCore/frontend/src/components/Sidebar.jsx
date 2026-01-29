import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, BookOpen, FileText, Bot } from "lucide-react";
import "../styles/clean-sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <Link 
          to="/menu" 
          className={`nav-link ${isActive("/menu") ? "active" : ""}`}
          title="Главное меню"
        >
          <Home className="nav-icon" />
          <span className="nav-link-tooltip">Главное меню</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`nav-link ${isActive("/profile") ? "active" : ""}`}
          title="Профиль"
        >
          <User className="nav-icon" />
          <span className="nav-link-tooltip">Профиль</span>
        </Link>
        
        <Link 
          to="/homework" 
          className={`nav-link ${isActive("/homework") ? "active" : ""}`}
          title="Домашние задания"
        >
          <BookOpen className="nav-icon" />
          <span className="nav-link-tooltip">Домашние задания</span>
        </Link>
        
        <Link 
          to="/journal" 
          className={`nav-link ${isActive("/journal") ? "active" : ""}`}
          title="Журнал"
        >
          <FileText className="nav-icon" />
          <span className="nav-link-tooltip">Журнал</span>
        </Link>
        
        <Link 
          to="/ai" 
          className={`nav-link ${isActive("/ai") ? "active" : ""}`}
          title="ИИ помощник"
        >
          <Bot className="nav-icon" />
          <span className="nav-link-tooltip">ИИ помощник</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
