import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import { getHomework, addHomework, deleteHomework } from "../api/homework.api";
import "../styles/homework.css";
import "../styles/homework-mobile.css";
import "../styles/animations.css";

export default function Homework() {
  const user = useAuth((state) => state.user);
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Загружаем ДЗ с бэкенда при открытии страницы
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
      const response = await addHomework(title, desc, imageUrl);
      setList([...list, response.data]);
      setTitle("");
      setDesc("");
      setImageUrl("");
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

  // Проверяем, может ли пользователь добавлять ДЗ (модератор или админ)
  const canAddHomework = user && (user.role === "Moderator" || user.role === "Admin");

  if (loading) {
    return (
      <div className="homework-page">
        <div className="loading-spinner">
          <div className="spinner-icon animate-spin"></div>
          <p>Загрузка заданий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homework-page">
      {/* Animated background */}
      <div className="particles-bg"></div>
      
      <div className="homework-container">
        <div className="homework-header animate-zoom-in">
          <h2 className="animate-neon">📚 Домашние задания</h2>
        </div>

        {/* Форма добавления - видна только для модераторов и админов */}
        {canAddHomework && (
          <div className="homework-form animate-bounce-in">
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
            <div className="form-row full">
              <div className="form-group">
                <label>📷 Ссылка на фото (необязательно)</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
            <button className="btn-add animate-glow" onClick={add}>
              ➕ Добавить задание
            </button>
          </div>
        )}

        {list.length === 0 ? (
          <div className="empty-message animate-fade-in">Заданий пока нет</div>
        ) : (
          <div className="homework-list">
            {list.map((h, index) => (
              <div key={h.id} className="homework-item animate-bounce-in" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Фото задания (если есть) */}
                {h.image_url && (
                  <div className="homework-image">
                    <img src={h.image_url} alt={h.title} />
                  </div>
                )}
                <div className="homework-item-content">
                  <h3>{h.title}</h3>
                  <p>{h.description}</p>
                </div>
                {/* Кнопка удаления видна только для модераторов и админов */}
                {canAddHomework && (
                  <button className="btn-delete" onClick={() => remove(h.id)} title="Удалить задание">
                    🗑️
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
