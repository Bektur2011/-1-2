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
        # СНАЧАЛА получаем всех пользователей для отладки
        print("STEP 1: Fetching ALL users from Supabase...")
        all_users_response = supabase.table('users').select('*').execute()
        print(f"Total users in database: {len(all_users_response.data) if all_users_response.data else 0}")
        
        if all_users_response.data:
            print("Sample passwords in database:")
            for user in all_users_response.data[:5]:
                db_password = user.get('password', '')
                print(f"  - User '{user.get('login')}' has password: '{db_password}' (length: {len(db_password)})")
        else:
            print("⚠️  WARNING: Supabase table 'users' is EMPTY!")
            print("⚠️  You need to run POST /api/init-users to load data!")
            print("=" * 60)
            return jsonify({
                "error": "Database is empty. Contact administrator.",
                "hint": "Run POST /api/init-users to initialize data"
            }), 500
        
        # ТЕПЕРЬ ищем пользователя по паролю
        print(f"\nSTEP 2: Searching user with password: '{password}' (length: {len(password)})")
        response = supabase.table('users').select('*').eq('password', password).execute()
        
        # Логируем результат запроса
        print(f"Supabase response data type: {type(response.data)}")
        print(f"Supabase response data length: {len(response.data) if response.data else 0}")
        
        # Дополнительная отладка: проверяем точное совпадение
        if not response.data:
            print("\n⚠️  LOGIN FAILED: No user found with this password")
            print("Comparing entered password with all passwords in database:")
            for user in all_users_response.data:
                db_pwd = user.get('password', '')
                if db_pwd == password:
                    print(f"  ✓ EXACT MATCH FOUND with user {user.get('login')}!")
                elif db_pwd.strip() == password.strip():
                    print(f"  ⚠️  Match after strip() with user {user.get('login')}")
                    print(f"     DB password: '{db_pwd}' vs Input: '{password}'")
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

# --- API для получения всех пользователей (с детальным логированием) ---
@app.route("/api/users", methods=["GET"])
def get_users():
    try:
        print("=" * 60)
        print("FETCHING ALL USERS FROM SUPABASE")
        print("=" * 60)
        response = supabase.table('users').select('*').execute()
        print(f"Users count: {len(response.data) if response.data else 0}")
        if response.data:
            print("Sample user passwords:")
            for user in response.data[:3]:  # Print first 3 users
                print(f"  - {user.get('login')}: '{user.get('password')}'")
        else:
            print("WARNING: No users found in Supabase table!")
        print("=" * 60)
        return jsonify(response.data)
    except Exception as e:
        print(f"ERROR fetching users: {str(e)}")
        print("=" * 60)
        return jsonify({"error": str(e)}), 500

# --- API для загрузки данных из users.json в Supabase (ТОЛЬКО ДЛЯ ИНИЦИАЛИЗАЦИИ!) ---
@app.route("/api/init-users", methods=["POST"])
def init_users():
    """
    Загружает пользователей из users.json в Supabase.
    ВНИМАНИЕ: Используйте ТОЛЬКО один раз для инициализации!
    """
    try:
        import json
        users_file_path = os.path.join(os.path.dirname(__file__), "data", "users.json")
        
        # Проверяем, существует ли файл
        if not os.path.exists(users_file_path):
            return jsonify({"error": "users.json not found"}), 404
        
        # Читаем файл
        with open(users_file_path, 'r', encoding='utf-8') as f:
            users = json.load(f)
        
        print("=" * 60)
        print(f"INITIALIZING SUPABASE WITH {len(users)} USERS")
        print("=" * 60)
        
        # Сначала проверяем, есть ли уже пользователи
        existing = supabase.table('users').select('id').execute()
        if existing.data and len(existing.data) > 0:
            print(f"WARNING: Table already contains {len(existing.data)} users")
            return jsonify({
                "error": "Table already contains users. Clear it first if you want to reinitialize.",
                "existing_count": len(existing.data)
            }), 400
        
        # Вставляем всех пользователей
        response = supabase.table('users').insert(users).execute()
        
        print(f"SUCCESS: Inserted {len(response.data)} users")
        print("=" * 60)
        
        return jsonify({
            "message": "Users initialized successfully",
            "count": len(response.data)
        }), 200
        
    except Exception as e:
        print(f"ERROR initializing users: {str(e)}")
        print("=" * 60)
        return jsonify({"error": str(e)}), 500

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
