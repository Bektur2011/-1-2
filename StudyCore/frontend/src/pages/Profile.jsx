import React from "react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

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
          <div className="profile-avatar">👤</div>
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
                    <div className="profile-field-label">Статус</div>
                    <div className="profile-field-value">✓ Активен</div>
                  </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  Выйти
                </button>
              </>
            ) : (
              <p>Пожалуйста, войдите в систему</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
