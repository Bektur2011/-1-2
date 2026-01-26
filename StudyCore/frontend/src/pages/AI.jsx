import React from "react";
import "../styles/new-ai.css";
import "../styles/new-animations.css";

const AI = () => {
  return (
    <div className="ai-page">
      <div className="ai-container">
        <div className="ai-icon animate-float">🤖</div>
        <div className="ai-message animate-scale-in">
          <h2>Искусственный интеллект</h2>
          <p>
            <strong>Эта функция в разработке</strong>
            <br /><br />
            Мы активно работаем над интеграцией мощных ИИ инструментов для помощи в обучении
          </p>
          <div className="ai-loading">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
