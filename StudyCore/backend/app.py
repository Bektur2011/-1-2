import os
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Путь к frontend dist
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/dist")

# Проверка наличия папки dist
if not os.path.exists(FRONTEND_DIST):
    print(f"WARNING: dist folder not found at {FRONTEND_DIST}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Available files: {os.listdir(os.path.dirname(os.path.abspath(__file__)))}")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
CORS(app)  # разрешаем кросс-доменные запросы

# Путь к данным
USERS_FILE = os.path.join(os.path.dirname(__file__), "data/users.json")
HOMEWORK_FILE = os.path.join(os.path.dirname(__file__), "data/homework.json")

# --- Helper функции ---
def read_users():
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def read_homework():
    if not os.path.exists(HOMEWORK_FILE):
        with open(HOMEWORK_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    with open(HOMEWORK_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_homework(data):
    with open(HOMEWORK_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# --- API для логина по паролю ---
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    password = data.get("password")
    
    print(f"Login attempt with password: '{password}'")  # для отладки

    users = read_users()
    user = next((u for u in users if u["password"] == password), None)

    if user:
        gender_prefix = "Ученица" if user.get("gender") == "Female" else "Ученик"
        response = {
            "id": user["id"],
            "name": user["name"],
            "role": user["role"],
            "gender": user["gender"],
            "welcome": f"Добро пожаловать {gender_prefix} {user['name']}"
        }
        print(f"Login successful for user: {user['name']}")
        return jsonify(response)
    
    print(f"Login failed: password not found")
    return jsonify({"error": "Неверный пароль"}), 401

# --- API для получения всех пользователей ---
@app.route("/users", methods=["GET"])
def get_users():
    users = read_users()
    return jsonify(users)

# --- API для домашнего задания ---
@app.route("/homework", methods=["GET"])
def get_homework():
    homework = read_homework()
    return jsonify(homework)

@app.route("/homework", methods=["POST"])
def add_homework():
    data = request.json
    homework = read_homework()
    homework.append(data)
    write_homework(homework)
    return jsonify(data), 201

# --- Раздача фронтенда ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # если путь существует в dist, отдаем файл
    file_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    # иначе отдаём index.html (SPA)
    index_path = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(app.static_folder, "index.html")
    # если нет index.html, возвращаем ошибку
    return jsonify({"error": "Frontend not built yet"}), 500

# --- Запуск ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # порт для Railway
    print(f"Server started on port {port}")
    app.run(host="0.0.0.0", port=port)
