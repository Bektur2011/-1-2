import React from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import { useAuth } from "../store/authStore";
import "../styles/clean-menu.css";

const Menu = () => {
  const profile = useAuth((state) => state.profile);
  const isCreator = !!profile?.role && String(profile.role).trim().toLowerCase() === "creator";

  return (
    <div className="menu-page">
      <div className="menu-container">
        <div className="menu-header">
          <h2>Главное меню</h2>
          {profile && (
            <p>
              Добро пожаловать, <strong>{profile.username || "Пользователь"}</strong>
              <span className="role-badge">{profile.role}</span>
            </p>
          )}
        </div>

        {isCreator && (
          <div className="quick-actions">
            <Link to="/creator" className="quick-card">
              <div className="quick-icon">
                <Wrench size={22} />
              </div>
              <div className="quick-text">
                <div className="quick-title">Creator Panel</div>
                <div className="quick-subtitle">Управление пользователями</div>
              </div>
            </Link>
          </div>
        )}

        <div className="info-sections">
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-icon">📚</span>
              <h3>Что такое StudyCore?</h3>
            </div>
            <div className="info-card-content">
              <p>
                <strong>StudyCore</strong> — это современная образовательная платформа, разработанная для
                эффективного управления учебным процессом.
              </p>
              <p>
                Платформа предоставляет инструменты для управления домашними заданиями.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-icon">🔐</span>
              <h3>Как стать администратором?</h3>
            </div>
            <div className="info-card-content">
              <p>
                Роль <strong>администратора</strong> предоставляет полный доступ к управлению платформой,
                включая модерацию контента и управление пользователями.
              </p>
              <p>Для получения роли администратора необходимо:</p>
              <ul>
                <li>Обратиться к модератору системы</li>
                <li>Доказать, что ты сможешь выполнять свои обязанности администратора</li>
              </ul>
              <p>
                <strong>Важно:</strong> Права администратора выдаются только проверенным и доверенным
                пользователям системы.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
