import React from "react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import "../styles/clean-profile.css";

const Profile = () => {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>Мой профиль</h2>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {user?.gender === "Female" ? "👩" : "👨"}
          </div>
          <div className="profile-info">
            {user ? (
              <>
                <h3>{user.name}</h3>
                <div className="profile-row">
                  <div className="profile-field">
                    <div className="profile-field-label">Роль</div>
                    <div className="profile-field-value">{user.role}</div>
                  </div>
                  <div className="profile-field">
                    <div className="profile-field-label">Пол</div>
                    <div className="profile-field-value">
                      {user.gender === "Female" ? "Женский" : "Мужской"}
                    </div>
                  </div>
                  <div className="profile-field">
                    <div className="profile-field-label">Статус</div>
                    <div className="profile-field-value">✓ Активен</div>
                  </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  Выйти из системы
                </button>
              </>
            ) : (
              <p>Пожалуйста, войдите в систему</p>
            )}
          </div>
        </div>

        <div className="profile-telegram">
          <div className="profile-telegram-text">
            Если вам лень заходить на сайт для просмотра домашних заданий то для вас есть телеграм бот в котором легко и быстро можете посмотреть домашнее задание:)
          </div>
          <a
            className="profile-telegram-link"
            href="https://t.me/homework_admin_bot"
            target="_blank"
            rel="noreferrer"
          >
            https://t.me/homework_admin_bot
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
