import React, { useEffect, useMemo, useState } from "react";
import { getUsers, getUserById, updateUserRole } from "../api/users.api";
import { getAttendance } from "../api/attendance.api";
import "../styles/clean-creator.css";

const Creator = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    setLoadingUsers(true);
    getUsers(12)
      .then((res) => {
        setUsers(res.data || []);
      })
      .catch((err) => {
        console.error("Ошибка загрузки пользователей:", err);
        setUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    setLoadingAttendance(true);
    getAttendance(14)
      .then((res) => {
        setAttendance(res.data || []);
      })
      .catch((err) => {
        console.error("Ошибка загрузки посещаемости:", err);
        setAttendance([]);
      })
      .finally(() => setLoadingAttendance(false));
  }, []);

  const maxCount = useMemo(() => {
    return attendance.reduce((max, item) => Math.max(max, item.count || 0), 0) || 1;
  }, [attendance]);

  const handleSearch = async () => {
    setSearchError("");
    setSearchResult(null);
    const id = Number(searchId);
    if (!id) {
      setSearchError("Введите корректный ID");
      return;
    }

    try {
      const res = await getUserById(id);
      setSearchResult(res.data);
    } catch (err) {
      setSearchError(err?.error || "Пользователь не найден");
    }
  };

  const applyRole = async (userId, role) => {
    try {
      const res = await updateUserRole(userId, role);
      const updated = res.data;
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (searchResult?.id === userId) {
        setSearchResult(updated);
      }
    } catch (err) {
      alert(err?.error || "Ошибка обновления роли");
    }
  };

  const renderRoleButton = (u) => {
    if (u.role === "Creator") {
      return <button className="btn-disabled" disabled>Creator</button>;
    }
    if (u.role === "Admin") {
      return (
        <button className="btn-warning" onClick={() => applyRole(u.id, "Student")}>
          Отобрать админку
        </button>
      );
    }
    return (
      <button className="btn-primary" onClick={() => applyRole(u.id, "Admin")}>
        Give Admin
      </button>
    );
  };

  return (
    <div className="creator-page">
      <div className="creator-container">
        <div className="creator-header">
          <h2>👑 Creator Panel</h2>
          <p>Управление пользователями и посещаемостью</p>
        </div>

        <div className="creator-grid">
          <div className="creator-card">
            <h3>🔎 Поиск пользователя по ID</h3>
            <div className="search-row">
              <input
                type="number"
                placeholder="Введите ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button className="btn-primary" onClick={handleSearch}>Найти</button>
            </div>
            {searchError && <div className="error-text">{searchError}</div>}
            {searchResult && (
              <div className="user-row">
                <div>
                  <div className="user-name">{searchResult.name}</div>
                  <div className="user-meta">ID: {searchResult.id} • {searchResult.role}</div>
                </div>
                <div className="user-actions">
                  {renderRoleButton(searchResult)}
                </div>
              </div>
            )}
          </div>

          <div className="creator-card">
            <h3>📊 Посещаемость (14 дней)</h3>
            {loadingAttendance ? (
              <div className="muted">Загрузка...</div>
            ) : (
              <div className="chart">
                {attendance.map((d) => (
                  <div key={d.date} className="bar-wrap" title={`${d.date}: ${d.count}`}>
                    <div
                      className="bar"
                      style={{ height: `${Math.round((d.count / maxCount) * 100)}%` }}
                    ></div>
                    <div className="bar-label">{d.date.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="creator-card">
          <h3>👥 Ученики (короткий список)</h3>
          {loadingUsers ? (
            <div className="muted">Загрузка...</div>
          ) : users.length === 0 ? (
            <div className="muted">Пользователей нет</div>
          ) : (
            <div className="user-list">
              {users.map((u) => (
                <div key={u.id} className="user-row">
                  <div>
                    <div className="user-name">{u.name}</div>
                    <div className="user-meta">ID: {u.id} • {u.role}</div>
                  </div>
                  <div className="user-actions">
                    {renderRoleButton(u)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Creator;
