import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import "../styles/modern-global.css";
import "../styles/modern-animations.css";
import "../styles/modern-menu.css";

const Menu = () => {
  const user = useAuth((state) => state.user);

  return (
    <div className="menu-page">
      <div className="menu-container">
        <div className="menu-header animate-fade-in-down">
          <h2>Главное меню</h2>
          {user && (
            <p>
              Добро пожаловать, <strong>{user.name}</strong>
              <span className="role-badge">{user.role}</span>
            </p>
          )}
        </div>

        {/* Информационные секции */}
        <div className="info-sections">
          {/* Что такое StudyCore */}
          <div className="info-card animate-fade-in-up">
            <div className="info-card-header">
              <span className="info-icon">📚</span>
              <h3>Что такое StudyCore?</h3>
            </div>
            <div className="info-card-content">
              <p>
                <strong>StudyCore</strong> — это современная образовательная платформа, разработанная для 
                эффективного управления учебным процессом. Наша система объединяет учеников, преподавателей 
                и администраторов в единую цифровую экосистему.
              </p>
              <p>
                Платформа предоставляет инструменты для отслеживания успеваемости, управления домашними 
                заданиями и взаимодействия между участниками образовательного процесса.
              </p>
            </div>
          </div>

          {/* Как это работает */}
          <div className="info-card animate-fade-in-up delay-100">
            <div className="info-card-header">
              <span className="info-icon">⚙️</span>
              <h3>Как это работает?</h3>
            </div>
            <div className="info-card-content">
              <p>Система построена на простых принципах:</p>
              <ul>
                <li><strong>Вход в систему</strong> — используйте персональный пароль для доступа</li>
                <li><strong>Профиль</strong> — управляйте своими данными и настройками</li>
                <li><strong>Домашние задания</strong> — создавайте и просматривайте задания</li>
                <li><strong>Журнал учеников</strong> — отслеживайте список пользователей системы</li>
                <li><strong>ИИ помощник</strong> — получайте помощь от искусственного интеллекта (в разработке)</li>
              </ul>
              <p>
                Все функции доступны через <span className="feature-highlight">интуитивный интерфейс</span> с 
                современным дизайном и удобной навигацией.
              </p>
            </div>
          </div>

          {/* Как стать администратором */}
          <div className="info-card animate-fade-in-up delay-200">
            <div className="info-card-header">
              <span className="info-icon">👑</span>
              <h3>Как стать администратором?</h3>
            </div>
            <div className="info-card-content">
              <p>
                Роль <strong>администратора</strong> предоставляет полный доступ к управлению платформой, 
                включая возможность модерации контента и управления пользователями.
              </p>
              <p>Для получения роли администратора необходимо:</p>
              <ul>
                <li>Обратиться к текущему администратору системы</li>
                <li>Предоставить обоснование для получения расширенных прав</li>
                <li>Пройти процедуру подтверждения личности</li>
              </ul>
              <p>
                <strong>Важно:</strong> Права администратора выдаются только проверенным и доверенным 
                пользователям системы. Модераторы и студенты могут запросить повышение роли через 
                официальные каналы связи.
              </p>
            </div>
          </div>
        </div>

        {/* Быстрые действия / Навигация */}
        <div className="quick-actions animate-fade-in-up delay-300">
          <Link to="/profile" className="quick-action-btn hover-lift">
            <span className="quick-action-icon">👤</span>
            <span className="quick-action-label">Профиль</span>
          </Link>
          <Link to="/homework" className="quick-action-btn hover-lift">
            <span className="quick-action-icon">📝</span>
            <span className="quick-action-label">Домашние задания</span>
          </Link>
          <Link to="/journal" className="quick-action-btn hover-lift">
            <span className="quick-action-icon">📖</span>
            <span className="quick-action-label">Журнал учеников</span>
          </Link>
          <Link to="/ai" className="quick-action-btn hover-lift">
            <span className="quick-action-icon">🤖</span>
            <span className="quick-action-label">ИИ помощник</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Menu;
