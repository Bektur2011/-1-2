import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Путь к frontend dist (build.sh копирует в корень проекта)
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../dist")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
CORS(app)  # разрешаем кросс-доменные запросы

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase env variables not found")

# Strip trailing slash if present
SUPABASE_URL = SUPABASE_URL.rstrip("/")

# Validate SUPABASE_URL format
if not SUPABASE_URL.startswith("https://") or not SUPABASE_URL.endswith(".supabase.co"):
    raise Exception("Invalid SUPABASE_URL format. Must be https://xxxx.supabase.co without trailing slash.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- API для логина по паролю ---
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    password = data.get("password")

    print(f"Login attempt with password: '{password}'")  # для отладки

    response = supabase.table('users').select('*').eq('password', password).execute()
    user = response.data[0] if response.data else None

    if user:
        gender_prefix = "Ученица" if user.get("gender") == "Female" else "Ученик"
        response_data = {
            "id": user["id"],
            "name": user["name"],
            "role": user["role"],
            "gender": user["gender"],
            "welcome": f"Добро пожаловать {gender_prefix} {user['name']}"
        }
        print(f"Login successful for user: {user['name']}")
        return jsonify(response_data)

    print(f"Login failed: password not found")
    return jsonify({"error": "Неверный пароль"}), 401

# --- API для получения всех пользователей ---
@app.route("/api/users", methods=["GET"])
def get_users():
    response = supabase.table('users').select('*').execute()
    return jsonify(response.data)

# --- API для домашнего задания ---
@app.route("/api/homework", methods=["GET"])
def get_homework():
    response = supabase.table('homework').select('*').execute()
    return jsonify(response.data)

@app.route("/api/homework", methods=["POST"])
def add_homework():
    data = request.json
    response = supabase.table('homework').insert(data).execute()
    return jsonify(response.data[0]), 201

@app.route("/api/homework/<int:hw_id>", methods=["DELETE"])
def delete_homework(hw_id):
    supabase.table('homework').delete().eq('id', hw_id).execute()
    return jsonify({"message": "Задание удалено"}), 200

# --- Раздача фронтенда ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # если путь существует в dist, отдаем файл
    file_path = os.path.join(FRONTEND_DIST, path)
    if path != "" and os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIST, path)
    # иначе отдаём index.html (SPA)
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_DIST, "index.html")
    # если нет index.html, возвращаем ошибку
    return jsonify({"error": "Frontend not built yet"}), 500

# --- Запуск ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # порт для Railway
    print(f"Server started on port {port}")
    app.run(host="0.0.0.0", port=port)
