import React, { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import axios from "../api/axios";
import "../styles/journal.css";

const Journal = () => {
  const user = useAuth((state) => state.user);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Загружаем пользователей с бэкенда через axios (использует базовый URL из api/axios.js)
    axios
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Ошибка загрузки пользователей:", err);
        setUsers([]); // Оставляем пустой массив при ошибке
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

  return (
    <div className="journal-page">
      <div className="journal-container">
        <div className="journal-header">
          <h2>📖 Журнал учеников</h2>
          {user && <p>Добро пожаловать, {user.role} {user.name}!</p>}
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-card-number">{stats.total}</div>
            <div className="stat-card-label">Всего пользователей</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-number">{stats.students}</div>
            <div className="stat-card-label">Студентов</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-number">{stats.moderators}</div>
            <div className="stat-card-label">Модераторов</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-number">{stats.admins}</div>
            <div className="stat-card-label">Администраторов</div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="empty-message">Пользователей пока нет</div>
        ) : (
          <div className="journal-table-wrapper">
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
                  <tr key={u.id} style={{ animationDelay: `${index * 0.05}s` }}>
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
