import { useState, useEffect } from "react";
import { useAuth } from "../store/authStore";
import { getHomework, addHomework, deleteHomework } from "../api/homework.api";
import "../styles/clean-homework.css";

export default function Homework() {
  const profile = useAuth((state) => state.profile);
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    try {
      const response = await getHomework();
      setList(response.data);
    } catch (err) {
      console.error("Ошибка загрузки ДЗ:", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const add = async () => {
    if (!title || !desc) {
      alert("Заполните название и описание!");
      return;
    }
    try {
      const response = await addHomework(title, desc);
      setList([...list, response.data]);
      setTitle("");
      setDesc("");
      alert("✅ Задание успешно добавлено!");
    } catch (err) {
      console.error("Ошибка при добавлении ДЗ:", err);
      alert("Ошибка при добавлении задания");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить это задание?")) {
      return;
    }
    try {
      await deleteHomework(id);
      setList(list.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Ошибка при удалении ДЗ:", err);
      alert("Ошибка при удалении задания");
    }
  };

  const canAddHomework = profile && (profile.role === "Creator" || profile.role === "Admin");

  if (loading) {
    return (
      <div className="homework-page">
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <p>Загрузка заданий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homework-page">
      <div className="homework-container">
        <div className="homework-header">
          <h2>📚 Домашние задания</h2>
        </div>

        {canAddHomework && (
          <div className="homework-form">
            <div className="form-row">
              <div className="form-group">
                <label>Название задания</label>
                <input
                  type="text"
                  placeholder="Введите название"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <input
                  type="text"
                  placeholder="Введите описание"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
            </div>
            <button className="btn-add" onClick={add}>
              ➕ Добавить задание
            </button>
          </div>
        )}

        {list.length === 0 ? (
          <div className="empty-message">Заданий пока нет</div>
        ) : (
          <div className="homework-list">
            {list.map((h) => (
              <div key={h.id} className="homework-item">
                <div className="homework-title">{h.title}</div>
                <div className="homework-desc">{h.description}</div>
                {canAddHomework && (
                  <button className="btn-delete" onClick={() => remove(h.id)}>
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
