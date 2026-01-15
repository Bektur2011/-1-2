// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { loginRequest } from "../api/auth.api";
import "../styles/global.css";
import "../styles/animations.css";

const Login = () => {
  const [password, setPassword] = useState(""); // состояние пароля
  const [loading, setLoading] = useState(false); // loader
  const [toast, setToast] = useState(""); // текст toast
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);

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
        // Редирект на меню
        navigate("/menu");
      } else {
        setToast("Неверный пароль");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      setToast("Ошибка сервера");
    }
  };

  return (
    <div className="login-page">
      <h2>Вход</h2>
      <input
        type="password"
        placeholder="Введите пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleLogin()}
      />
      <button onClick={handleLogin}>{loading ? "Вход..." : "Войти"}</button>

      {/* Toast-сообщение */}
      {toast && (
        <div className="toast show">
          <span>{toast}</span>
          <button onClick={() => setToast("")}>×</button>
        </div>
      )}
    </div>
  );
};

export default Login;

