import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/authStore";
import "../styles/clean-profile.css";

const Profile = () => {
  const profile = useAuth((state) => state.profile);
  const clearAuth = useAuth((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>Мой профиль</h2>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            {profile ? (
              <>
                <h3>{profile.username || "Пользователь"}</h3>
                <div className="profile-row">
                  <div className="profile-field">
                    <div className="profile-field-label">Роль</div>
                    <div className="profile-field-value">{profile.role}</div>
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
