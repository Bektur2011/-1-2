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
# Configure CORS to allow requests from any origin in production
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

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
    """
    Endpoint для авторизации пользователя по паролю
    POST /api/login
    Body: { "password": "пароль" }
    """
    # Получаем данные из запроса
    data = request.json
    if not data:
        print("ERROR: No JSON data received")
        return jsonify({"error": "Некорректный запрос"}), 400
    
    # Извлекаем пароль и убираем пробелы
    password = data.get("password", "").strip()
    
    # Детальное логирование
    print("=" * 60)
    print("LOGIN ATTEMPT")
    print("=" * 60)
    print(f"PASSWORD FROM CLIENT: '{password}'")
    print(f"PASSWORD LENGTH: {len(password)}")
    print(f"REQUEST METHOD: {request.method}")
    print(f"REQUEST ORIGIN: {request.headers.get('Origin', 'No origin')}")
    print(f"CONTENT-TYPE: {request.headers.get('Content-Type', 'Not set')}")
    print("=" * 60)
    
    # Проверка что пароль предоставлен
    if not password:
        print("ERROR: Password is empty")
        return jsonify({"error": "Пароль не указан"}), 400
    
    try:
        # Запрос к Supabase
        print(f"Searching user in Supabase with password: '{password}'")
        response = supabase.table('users').select('*').eq('password', password).execute()
        
        # Логируем результат запроса
        print(f"Supabase response data type: {type(response.data)}")
        print(f"Supabase response data length: {len(response.data) if response.data else 0}")
        
        # Проверяем результат (response.data - это массив)
        if not response.data:
            print("LOGIN FAILED: No user found with this password")
            print("=" * 60)
            return jsonify({"error": "Неверный пароль"}), 401
        
        # Получаем первого пользователя из массива
        user = response.data[0]
        print(f"USER FOUND: {user.get('login', 'unknown')} ({user.get('name', 'unknown')})")
        print(f"USER ROLE: {user.get('role', 'unknown')}")
        print(f"USER GENDER: {user.get('gender', 'unknown')}")
        
        # Формируем ответ (НЕ возвращаем пароль!)
        response_data = {
            "id": user["id"],
            "login": user["login"],
            "name": user["name"],
            "role": user["role"],
            "gender": user["gender"]
        }
        
        print(f"LOGIN SUCCESSFUL for user: {user['name']}")
        print("=" * 60)
        return jsonify(response_data), 200
        
    except KeyError as e:
        # Ошибка структуры данных
        print(f"ERROR: Missing field in user data: {str(e)}")
        print("=" * 60)
        return jsonify({"error": "Ошибка данных пользователя"}), 500
        
    except Exception as e:
        # Любая другая ошибка
        print(f"DATABASE ERROR: {str(e)}")
        print(f"ERROR TYPE: {type(e).__name__}")
        print("=" * 60)
        return jsonify({"error": "Ошибка сервера"}), 500

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
