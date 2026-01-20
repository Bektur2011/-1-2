import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore";
import { getHomework, addHomework, deleteHomework } from "../api/homework.api";
import { uploadFile } from "../api/upload.api";
import "../styles/homework.css";
import "../styles/homework-mobile.css";
import "../styles/animations.css";

export default function Homework() {
  const user = useAuth((state) => state.user);
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверяем размер файла (макс 16MB)
      if (file.size > 16 * 1024 * 1024) {
        alert("Файл слишком большой! Максимальный размер: 16MB");
        return;
      }
      setSelectedFile(file);
      // Создаём превью для изображений
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageUrl(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const add = async () => {
    if (!title || !desc) {
      alert("Заполните название и описание!");
      return;
    }
    
    try {
      setUploading(true);
      let finalImageUrl = imageUrl;
      
      // Если выбран файл, пытаемся загрузить его
      if (selectedFile) {
        try {
          const uploadResult = await uploadFile(selectedFile);
          finalImageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Ошибка загрузки файла:", uploadError);
          // Спрашиваем пользователя хочет ли он продолжить без фото
          const continueWithout = window.confirm(
            "Не удалось загрузить файл. Создать задание без фото?"
          );
          if (!continueWithout) {
            setUploading(false);
            return;
          }
          finalImageUrl = ""; // Создаём без фото
        }
      }
      
      const response = await addHomework(title, desc, finalImageUrl);
      setList([...list, response.data]);
      setTitle("");
      setDesc("");
      setImageUrl("");
      setSelectedFile(null);
      // Сбрасываем input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error("Ошибка при добавлении ДЗ:", err);
      alert("Ошибка при добавлении задания. Проверьте подключение к базе данных.");
    } finally {
      setUploading(false);
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
                <label>🖼️ Ссылка на изображение (необязательно)</label>
                <input
                  type="text"
                  placeholder="Вставьте ссылку на изображение (например, https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={selectedFile !== null}
                />
              </div>
            </div>
            <div className="form-row full">
              <div className="form-group">
                <label>📎 Или загрузите файл (необязательно)</label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="file-input"
                  disabled={imageUrl !== "" && !selectedFile}
                />
                {selectedFile && (
                  <div className="file-preview">
                    <span className="file-name">📄 {selectedFile.name}</span>
                    <button 
                      className="btn-remove-file" 
                      onClick={() => {
                        setSelectedFile(null);
                        setImageUrl("");
                        const fileInput = document.querySelector('input[type="file"]');
                        if (fileInput) fileInput.value = '';
                      }}
                      title="Удалить файл"
                    >
                      ✖
                    </button>
                  </div>
                )}
                {imageUrl && selectedFile && selectedFile.type.startsWith('image/') && (
                  <div className="image-preview">
                    <img src={imageUrl} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <button 
              className="btn-add animate-glow" 
              onClick={add}
              disabled={uploading}
            >
              {uploading ? "⏳ Загрузка..." : "➕ Добавить задание"}
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
