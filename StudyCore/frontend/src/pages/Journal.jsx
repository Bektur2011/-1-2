import React, { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import { getUsers } from "../api/users.api";
import "../styles/journal.css";
import "../styles/animations.css";

const Journal = () => {
  const user = useAuth((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки пользователей:", err);
        setUsers([]);
        setLoading(false);
      });
  }, []);

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "Student").length,
    moderators: users.filter((u) => u.role === "Moderator").length,
    admins: users.filter((u) => u.role === "Admin").length,
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Admin":
        return "role-admin";
      case "Moderator":
        return "role-moderator";
      default:
        return "role-student";
    }
  };

  const getGenderIcon = (gender) => {
    return gender === "Female" ? "👩" : "👨";
  };

  if (loading) {
    return (
      <div className="journal-page">
        <div className="loading-spinner">
          <div className="spinner-icon animate-spin"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
      {/* Animated background */}
      <div className="particles-bg"></div>
      
      <div className="journal-container">
        <div className="journal-header animate-zoom-in">
          <h2 className="animate-neon">📖 Журнал учеников</h2>
          {user && <p className="animate-fade-in">Добро пожаловать, {user.role} {user.name}!</p>}
        </div>

        <div className="stats-row">
          <div className="stat-card animate-bounce-in" style={{ animationDelay: '0s' }}>
            <div className="stat-card-number animate-pulse">{stats.total}</div>
            <div className="stat-card-label">Всего пользователей</div>
          </div>
          <div className="stat-card animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-number animate-pulse">{stats.students}</div>
            <div className="stat-card-label">Студентов</div>
          </div>
          <div className="stat-card animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card-number animate-pulse">{stats.moderators}</div>
            <div className="stat-card-label">Модераторов</div>
          </div>
          <div className="stat-card animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-card-number animate-pulse">{stats.admins}</div>
            <div className="stat-card-label">Администраторов</div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="empty-message animate-fade-in">Пользователей пока нет</div>
        ) : (
          <div className="journal-table-wrapper animate-fade-in">
            <table className="journal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Логин</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Пол</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>{u.id}</td>
                    <td>{u.login}</td>
                    <td>
                      <span className="gender-icon">{getGenderIcon(u.gender)}</span>
                      {u.name}
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.gender === "Female" ? "Женский" : "Мужской"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
