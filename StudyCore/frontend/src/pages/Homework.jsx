import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import { getHomework, addHomework, deleteHomework } from "../api/homework.api";
import "../styles/clean-global.css";
import "../styles/clean-homework.css";

export default function Homework() {
  const user = useAuth((state) => state.user);
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
      
      if (err.response?.status !== 404) {
        const errorMessage = err.response?.data?.error || err.message || "Не удалось загрузить задания";
        console.error("Детали ошибки:", errorMessage);
      }
      
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
      console.error("Детали ошибки:", err.response?.data);
      
      const errorData = err.response?.data || {};
      const errorMessage = errorData.error || err.message || "Неизвестная ошибка";
      const errorHint = errorData.hint || "";
      const fixFile = errorData.fix_file || "";
      
      let alertMessage = `❌ ${errorMessage}`;
      
      if (errorHint) {
        alertMessage += `\n\n💡 Решение:\n${errorHint}`;
      }
      
      if (fixFile) {
        alertMessage += `\n\n📄 Инструкция: ${fixFile}`;
      }
      
      if (errorData.details) {
        console.error("Техническая ошибка:", errorData.details);
        alertMessage += `\n\n🔧 Для разработчика: смотрите консоль (F12)`;
      }
      
      alert(alertMessage);
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

  const canAddHomework = user && (user.role === "Moderator" || user.role === "Admin");

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
            <button 
              className="btn-add" 
              onClick={add}
            >
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
                <div className="homework-item-content">
                  <h3>{h.title}</h3>
                  <p>{h.description}</p>
                </div>
                {canAddHomework && (
                  <button className="btn-delete" onClick={() => remove(h.id)} title="Удалить задание">
                    🗑️ Удалить
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
