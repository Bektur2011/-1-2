import React, { useEffect, useState } from "react";
import { getUsers } from "../api/users.api";
import "../styles/clean-journal.css";

const Journal = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then((res) => {
        setUsers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки пользователей:", err);
        setUsers([]);
        setLoading(false);
      });
  }, []);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Admin":
        return "role-admin";
      case "Creator":
        return "role-creator";
      default:
        return "role-student";
    }
  };

  if (loading) {
    return (
      <div className="journal-page">
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <div className="journal-container">
        <div className="journal-header">
          <h2>📘 Журнал учеников</h2>
        </div>

        {users.length === 0 ? (
          <div className="empty-table">Пользователей пока нет</div>
        ) : (
          <div className="table-container">
            <table className="journal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Роль</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td data-label="ID">{u.id}</td>
                    <td data-label="Имя">{u.username || "—"}</td>
                    <td data-label="Роль">
                      <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
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
