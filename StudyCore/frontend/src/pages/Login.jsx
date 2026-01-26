// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { loginRequest } from "../api/auth.api";
import "../styles/new-global.css";
import "../styles/new-animations.css";
import "../styles/new-login.css";

const Login = () => {
  const [password, setPassword] = useState(""); // состояние пароля
  const [loading, setLoading] = useState(false); // loader
  const [toast, setToast] = useState(""); // текст toast
  const [showWelcome, setShowWelcome] = useState(true); // Приветственное сообщение
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);

  // Hide welcome message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = async () => {
    if (!password) {
      setToast("Введите пароль!");
      return;
    }

    setLoading(true);

    try {
      const response = await loginRequest(password.trim());
      const data = response.data;
      
      setLoading(false);

      if (data.id) {
        // Сохраняем пользователя в store
        login({ 
          id: data.id,
          name: data.name, 
          role: data.role,
          gender: data.gender
        });
        // Show success message before redirect
        setToast(`Добро пожаловать, ${data.name}!`);
        setTimeout(() => {
          navigate("/menu");
        }, 1000);
      } else if (data.error) {
        setToast(data.error);
      } else {
        setToast("Неверный пароль");
      }
    } catch (err) {
      setLoading(false);
      console.error("Login error:", err);
      
      // Проверяем статус ошибки
      if (err.response && err.response.status === 401) {
        setToast("Неверный пароль");
      } else if (err.response && err.response.data && err.response.data.error) {
        setToast(err.response.data.error);
      } else if (err.code === 'ECONNABORTED') {
        setToast("Превышено время ожидания. Проверьте соединение.");
      } else if (err.message === 'Network Error') {
        setToast("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        setToast("Ошибка сервера. Попробуйте позже.");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      {/* Animated particles background */}
      <div className="particles-bg"></div>
      
      {/* Welcome message */}
      {showWelcome && (
        <div className="welcome-banner animate-bounce-in">
          <h1 className="animate-neon">StudyCore</h1>
          <p className="animate-fade-in">Система управления обучением</p>
        </div>
      )}

      {/* Login form */}
      <div className="login-card animate-zoom-in">
        <div className="login-icon animate-pulse">🔐</div>
        <h2 className="animate-slide-down">Вход в систему</h2>
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="login-input"
          />
          <div className="input-underline"></div>
        </div>
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className={`login-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Вход...
            </>
          ) : (
            <>
              <span className="button-icon">→</span>
              Войти
            </>
          )}
        </button>
        <div className="login-footer animate-fade-in">
          <p>Введите ваш пароль для доступа к системе</p>
        </div>
      </div>

      {/* Toast notification with epic animation */}
      {toast && (
        <div className="toast show animate-bounce-in">
          <span className="toast-icon">
            {toast.includes("Добро пожаловать") ? "✅" : "⚠️"}
          </span>
          <span className="toast-message">{toast}</span>
          <button onClick={() => setToast("")} className="toast-close">×</button>
        </div>
      )}
    </div>
  );
};

export default Login;
