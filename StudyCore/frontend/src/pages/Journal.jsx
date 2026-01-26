import React, { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import { getUsers } from "../api/users.api";
import "../styles/new-journal.css";
import "../styles/new-animations.css";

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
      <div className="journal-container">
        <div className="journal-header animate-fade-in-down">
          <h2>📖 Журнал учеников</h2>
        </div>

        {users.length === 0 ? (
          <div className="empty-table animate-fade-in-up">Пользователей пока нет</div>
        ) : (
          <div className="table-container animate-scale-in delay-100">
            <table className="journal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Логин</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Пол</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.login}</td>
                    <td>
                      {getGenderIcon(u.gender)} {u.name}
                    </td>
                    <td>{u.role}</td>
                    <td>{u.gender === "Female" ? "Женский" : "Мужской"}</td>
                    <td>
                      <span className="status-badge active">Активен</span>
                    </td>
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
