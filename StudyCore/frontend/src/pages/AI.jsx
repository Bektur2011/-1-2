import React from "react";
import "../styles/ai.css";

const AI = () => {
  return (
    <div className="ai-page">
      <div className="ai-container">
        <div className="ai-header">
          <h2>🤖 Искусственный интеллект</h2>
        </div>

        <div className="ai-card">
          <div className="ai-icon">🚀</div>
          <div className="ai-text">
            <strong>Эта функция в разработке</strong>
            <br />
            Мы активно работаем над интеграцией мощных ИИ инструментов для помощи в обучении
          </div>

          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <div className="feature-title">Проверка ДЗ</div>
              <div className="feature-desc">Автоматическая проверка домашних заданий</div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">💡</span>
              <div className="feature-title">Подсказки</div>
              <div className="feature-desc">Интеллектуальные подсказки при затруднениях</div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div className="feature-title">Аналитика</div>
              <div className="feature-desc">Анализ прогресса и рекомендации</div>
            </div>
          </div>

          <button className="btn-coming-soon" disabled>
            ⏳ Скоро доступно
          </button>
        </div>
      </div>
    </div>
  );
};

export default AI;
