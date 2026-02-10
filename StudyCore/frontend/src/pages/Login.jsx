import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Chrome } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/authStore";
import "../styles/clean-login.css";

const Login = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.setAuth);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const ensureProfile = async (userId, name) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) return data;

    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username: name,
        role: "Student"
      })
      .select()
      .single();

    return created;
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      showToast("Заполните email, username и пароль");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username: username.trim() }
      }
    });
    if (error) {
      setLoading(false);
      showToast(error.message);
      return;
    }
    const user = data.user;
    if (user) {
      const profile = await ensureProfile(user.id, username.trim());
      setAuth(user, profile);
      navigate("/menu");
    } else {
      showToast("Проверьте почту для подтверждения регистрации");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Введите email и пароль");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      setLoading(false);
      showToast(error.message);
      return;
    }
    const user = data.user;
    const profile = await ensureProfile(user.id, user.user_metadata?.username || "User");
    setAuth(user, profile);
    setLoading(false);
    navigate("/menu");
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Lock className="login-icon" size={44} />
        <h2>{isRegister ? "Регистрация" : "Вход"}</h2>

        <div className="input-wrapper">
          <Mail className="input-icon" size={18} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            disabled={loading}
          />
        </div>

        {isRegister && (
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              disabled={loading}
            />
          </div>
        )}

        <div className="input-wrapper">
          <Lock className="input-icon" size={18} />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            disabled={loading}
          />
        </div>

        <button
          onClick={isRegister ? handleRegister : handleLogin}
          disabled={loading}
          className={`login-button ${loading ? "loading" : ""}`}
        >
          {loading ? "Подождите..." : isRegister ? "Создать аккаунт" : "Войти"}
        </button>

        <button className="login-button google" onClick={handleGoogle} disabled={loading}>
          <Chrome size={18} />
          Войти через Google
        </button>

        <div className="login-footer">
          <p>
            {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Войти" : "Регистрация"}
            </button>
          </p>
        </div>
      </div>

      {toast && (
        <div className={`toast show error`}>
          <span className="toast-icon">⚠️</span>
          <span className="toast-message">{toast}</span>
          <button onClick={() => setToast("")} className="toast-close">×</button>
        </div>
      )}
    </div>
  );
};

export default Login;
