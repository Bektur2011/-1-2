import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { loginRequest } from "../api/auth.api";
import { Lock } from "lucide-react";
import "../styles/clean-login.css";

const Login = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
        login({ 
          id: data.id,
          name: data.name, 
          role: data.role,
          gender: data.gender
        });
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
      {showWelcome && (
        <div className="welcome-banner">
          <h1>StudyCore</h1>
          <p>Современная система управления обучением</p>
        </div>
      )}

      <div className="login-card">
        <Lock className="login-icon" size={48} />
        <h2>Вход</h2>
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
        <div className="login-footer">
          <p>Введите ваш пароль для доступа к платформе</p>
        </div>
      </div>

      {toast && (
        <div className={`toast show ${toast.includes("Добро пожаловать") ? "success" : "error"}`}>
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
