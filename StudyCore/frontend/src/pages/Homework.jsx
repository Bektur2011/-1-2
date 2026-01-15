import { useEffect, useState } from "react";
import "../styles/homework.css";

export default function Homework() {
  const [list, setList] = useState([
    { id: 1, title: "Математика", description: "Решить задачи на алгебру" },
    { id: 2, title: "Русский язык", description: "Написать сочинение" },
  ]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const add = () => {
    if (!title || !desc) {
      alert("Заполните все поля!");
      return;
    }
    const newHomework = {
      id: list.length + 1,
      title: title,
      description: desc,
    };
    setList([...list, newHomework]);
    setTitle("");
    setDesc("");
  };

  return (
    <div className="homework-page">
      <div className="homework-container">
        <div className="homework-header">
          <h2>📚 Домашние задания</h2>
        </div>

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

        {list.length === 0 ? (
          <div className="empty-message">Заданий пока нет</div>
        ) : (
          <div className="homework-list">
            {list.map((h, index) => (
              <div key={h.id} className="homework-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="homework-item-content">
                  <h3>{h.title}</h3>
                  <p>{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
