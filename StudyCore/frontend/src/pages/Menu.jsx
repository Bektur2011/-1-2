import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import "../styles/menu.css";

const Menu = () => {
  const user = useAuth((state) => state.user);

  return (
    <div className="menu-page">
      <div className="menu-container">
        <div className="menu-header">
          <h2>Главное меню</h2>
          {user && (
            <p>
              Добро пожаловать, <strong>{user.name}</strong>
              <span className="role-badge">{user.role}</span>
            </p>
          )}
        </div>
        <nav>
          <ul className="menu-nav">
            <li>
              <Link to="/profile">
                <span className="menu-icon icon-profile"></span>
                <span>Профиль</span>
              </Link>
            </li>
            <li>
              <Link to="/homework">
                <span className="menu-icon icon-homework"></span>
                <span>Домашние задания</span>
              </Link>
            </li>
            <li>
              <Link to="/journal">
                <span className="menu-icon icon-journal"></span>
                <span>Журнал учеников</span>
              </Link>
            </li>
            <li>
              <Link to="/ai">
                <span className="menu-icon icon-ai"></span>
                <span>ИИ (в разработке)</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Menu;
