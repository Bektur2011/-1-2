import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/authStore";
import { sendMessageToAI, getAIStatus } from "../api/ai.api";
import "../styles/new-ai.css";

const AI = () => {
  const user = useAuth((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const messagesEndRef = useRef(null);

  // Проверяем доступность AI при загрузке
  useEffect(() => {
    checkAIStatus();
  }, []);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAIStatus = async () => {
    try {
      const response = await getAIStatus();
      setAiAvailable(response.data.available);
      setChecking(false);
    } catch (err) {
      console.error("Ошибка проверки AI статуса:", err);
      setAiAvailable(false);
      setChecking(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText.trim();
    setInput("");
    setError("");

    // Добавляем сообщение пользователя
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, newUserMessage]);

    setLoading(true);

    try {
      // Формируем историю для AI (только role и content)
      const history = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        content: msg.content
      }));

      const response = await sendMessageToAI(userMessage, history);
      
      // Добавляем ответ AI
      const aiMessage = {
        role: "bot",
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Ошибка отправки сообщения:", err);
      const errorMessage = err.response?.data?.error || "Не удалось получить ответ от AI";
      const errorHint = err.response?.data?.hint || "";
      setError(`${errorMessage}${errorHint ? `. ${errorHint}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    sendMessage(suggestion);
  };

  if (checking) {
    return (
      <div className="ai-page">
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <p>Проверка доступности AI...</p>
        </div>
      </div>
    );
  }

  if (!aiAvailable) {
    return (
      <div className="ai-page">
        <div className="ai-header">
          <h2>🤖 AI Помощник</h2>
          <div className="ai-status offline">
            <span className="status-dot"></span>
            Не настроен
          </div>
        </div>
        <div className="ai-chat-container">
          <div className="ai-empty-state">
            <div className="ai-empty-icon">🤖</div>
            <h3>AI чат не настроен</h3>
            <p>
              Администратор должен добавить <strong>GEMINI_API_KEY</strong> в конфигурацию сервера.
              <br /><br />
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--neon-cyan)', textDecoration: 'underline' }}
              >
                Получить ключ API →
              </a>
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-lg)' }}>
              💡 Пока что вы можете использовать ChatGPT или другие AI-сервисы
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-page">
      {/* Header */}
      <div className="ai-header">
        <h2>🤖 AI Помощник StudyCore</h2>
        <div className="ai-status">
          <span className="status-dot"></span>
          Онлайн • Gemini 2.0 Flash
        </div>
      </div>

      {/* Chat Container */}
      <div className="ai-chat-container">
        {/* Messages */}
        <div className="ai-messages">
          {messages.length === 0 ? (
            <div className="ai-empty-state">
              <div className="ai-empty-icon">✨</div>
              <h3>Привет, {user?.name || "студент"}! 👋</h3>
              <p>
                Я твой AI помощник в обучении. Задавай любые вопросы по учебе,
                и я постараюсь помочь тебе понять материал!
              </p>
              <div className="ai-suggestions">
                <button 
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick("Объясни мне что такое квадратное уравнение")}
                >
                  📐 Математика
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick("Помоги разобраться с Present Perfect")}
                >
                  🇬🇧 Английский
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick("Расскажи про фотосинтез простыми словами")}
                >
                  🧬 Биология
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick("Как правильно писать сочинение?")}
                >
                  📝 Русский язык
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={index} className={`ai-message ${msg.role}`}>
                  <div className={`message-avatar ${msg.role}`}>
                    {msg.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div className="message-content">
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                    <div className="message-time">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ai-message bot">
                  <div className="message-avatar bot">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="ai-error">
            ⚠️ {error}
          </div>
        )}

        {/* Input Area */}
        <div className="ai-input-area">
          <div className="ai-input-wrapper">
            <textarea
              className="ai-input"
              placeholder="Задай вопрос AI помощнику..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows="1"
            />
            <button
              className={`ai-send-button ${loading ? "loading" : ""}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Отправить сообщение"
            >
              {loading ? "⏳" : "🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
