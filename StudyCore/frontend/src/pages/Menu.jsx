import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import "../styles/menu.css";
import "../styles/animations.css";

const Menu = () => {
  const user = useAuth((state) => state.user);

  const menuItems = [
    { to: "/profile", icon: "icon-profile", label: "Профиль", delay: "0s" },
    { to: "/homework", icon: "icon-homework", label: "Домашние задания", delay: "0.1s" },
    { to: "/journal", icon: "icon-journal", label: "Журнал учеников", delay: "0.2s" },
    { to: "/ai", icon: "icon-ai", label: "ИИ (в разработке)", delay: "0.3s" }
  ];

  return (
    <div className="menu-page">
      {/* Animated background */}
      <div className="particles-bg"></div>
      
      <div className="menu-container">
        <div className="menu-header animate-zoom-in">
          <h2 className="animate-neon">Главное меню</h2>
          {user && (
            <p className="animate-fade-in">
              Добро пожаловать, <strong>{user.name}</strong>
              <span className="role-badge animate-pulse">{user.role}</span>
            </p>
          )}
        </div>
        <nav>
          <ul className="menu-nav">
            {menuItems.map((item, index) => (
              <li key={item.to} className="animate-bounce-in" style={{ animationDelay: item.delay }}>
                <Link to={item.to}>
                  <span className={`menu-icon ${item.icon} animate-float`}></span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Menu;
