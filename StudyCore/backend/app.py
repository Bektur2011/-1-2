import os
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import uuid
from google import genai

# Load environment variables
load_dotenv()

# Путь к frontend dist (build.sh копирует в корень проекта)
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../dist")

# Папка для загруженных файлов
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt'}

# Создаём папку uploads если её нет
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Максимум 16MB
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

# Gemini AI setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        # Инициализируем клиент
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Системный промпт для AI помощника
        SYSTEM_INSTRUCTION = """Ты - AI помощник для образовательной платформы StudyCore. 
Твоя задача - помогать студентам с учебой: отвечать на вопросы по темам, 
объяснять материал простым языком, помогать с домашними заданиями.

Правила:
- Отвечай на русском языке
- Будь дружелюбным и поддерживающим
- Объясняй сложные вещи простыми словами
- Если не знаешь ответ - честно признайся
- Мотивируй студентов к обучению
- Используй эмодзи для лучшего восприятия ✨📚🎯

Помни: ты здесь чтобы помочь учиться, а не давать готовые ответы!"""
        
        ai_model = {
            'client': client,
            'system_instruction': SYSTEM_INSTRUCTION
        }
        print("✅ Gemini AI initialized successfully (google.genai)")
    except Exception as e:
        print(f"❌ Error initializing Gemini AI: {str(e)}")
        ai_model = None
else:
    ai_model = None
    print("⚠️  WARNING: GEMINI_API_KEY not configured. AI chat will be disabled.")

# --- Вспомогательные функции для файлов ---
def allowed_file(filename):
    """Проверяет допустимость расширения файла"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- API для загрузки файлов ---
@app.route("/api/upload", methods=["POST"])
def upload_file():
    """
    Загружает файл в Supabase Storage и возвращает публичный URL
    """
    try:
        print("=" * 60)
        print("FILE UPLOAD REQUEST")
        print("=" * 60)
        
        # Проверяем наличие файла в запросе
        if 'file' not in request.files:
            print("ERROR: No file in request")
            print("=" * 60)
            return jsonify({"error": "Файл не найден в запросе"}), 400
        
        file = request.files['file']
        
        # Проверяем что файл выбран
        if file.filename == '':
            print("ERROR: Empty filename")
            print("=" * 60)
            return jsonify({"error": "Файл не выбран"}), 400
        
        # Проверяем расширение
        if not allowed_file(file.filename):
            print(f"ERROR: File type not allowed: {file.filename}")
            print("=" * 60)
            return jsonify({"error": "Неподдерживаемый формат файла"}), 400
        
        # Генерируем уникальное имя файла
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Читаем содержимое файла
        file_content = file.read()
        
        # Определяем MIME тип
        mime_types = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain'
        }
        content_type = mime_types.get(ext, 'application/octet-stream')
        
        print(f"Uploading to Supabase Storage: {unique_filename}")
        print(f"File size: {len(file_content)} bytes")
        print(f"Content type: {content_type}")
        
        # Загружаем файл в Supabase Storage
        # Bucket: homework-files (нужно создать в Supabase, если его нет)
        bucket_name = "homework-files"
        
        try:
            # Пытаемся загрузить файл в bucket
            upload_response = supabase.storage.from_(bucket_name).upload(
                path=unique_filename,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            print(f"Supabase upload response: {upload_response}")
            
            # Получаем публичный URL
            public_url = supabase.storage.from_(bucket_name).get_public_url(unique_filename)
            
            print(f"SUCCESS: File uploaded to Supabase Storage")
            print(f"Public URL: {public_url}")
            print("=" * 60)
            
            return jsonify({
                "url": public_url,
                "filename": unique_filename
            }), 200
            
        except Exception as storage_error:
            error_message = str(storage_error)
            print(f"Supabase Storage Error: {error_message}")
            
            # Проверяем специфичные ошибки
            if "not found" in error_message.lower() or "bucket" in error_message.lower():
                print("=" * 60)
                print("⚠️  HINT: Bucket 'homework-files' does not exist!")
                print("⚠️  Create it in Supabase Dashboard:")
                print("   1. Go to Storage in Supabase Dashboard")
                print("   2. Create new bucket: 'homework-files'")
                print("   3. Make it PUBLIC (Settings -> Public bucket: ON)")
                print("=" * 60)
                return jsonify({
                    "error": "Storage bucket not configured",
                    "hint": "Create 'homework-files' bucket in Supabase Storage and make it public"
                }), 500
            
            # Другие ошибки
            print("=" * 60)
            raise
        
    except Exception as e:
        print(f"ERROR uploading file: {str(e)}")
        print(f"ERROR TYPE: {type(e).__name__}")
        print("=" * 60)
        return jsonify({"error": f"Ошибка загрузки файла: {str(e)}"}), 500

# --- Раздача загруженных файлов (для обратной совместимости, если нужно) ---
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    """Отдаёт загруженные файлы из локальной папки (запасной вариант)"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def log_attendance(user):
    try:
        supabase.table('attendance').insert({
            "user_id": user.get("id"),
            "login": user.get("login"),
            "name": user.get("name"),
            "role": user.get("role")
        }).execute()
    except Exception as e:
        print(f"ATTENDANCE LOG ERROR: {str(e)}")

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
        log_attendance(user)
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
        limit = request.args.get("limit", "").strip()
        query = supabase.table('users').select('*').order('id')
        if limit.isdigit():
            query = query.limit(int(limit))
        response = query.execute()
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

@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    try:
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        if not response.data:
            return jsonify({"error": "User not found"}), 404
        return jsonify(response.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>/role", methods=["PUT"])
def update_user_role(user_id):
    try:
        data = request.json or {}
        role = (data.get("role") or "").strip()
        allowed_roles = {"Student", "Admin", "Creator"}
        if role not in allowed_roles:
            return jsonify({"error": "Invalid role"}), 400
        response = supabase.table('users').update({"role": role}).eq('id', user_id).execute()
        if not response.data:
            return jsonify({"error": "User not found"}), 404
        return jsonify(response.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/attendance", methods=["GET"])
def get_attendance():
    try:
        days_param = request.args.get("days", "14").strip()
        days = int(days_param) if days_param.isdigit() else 14
        days = max(1, min(days, 90))

        start_date = (datetime.now(timezone.utc).date() - timedelta(days=days - 1))
        response = supabase.table('attendance').select('created_at').gte('created_at', start_date.isoformat()).execute()

        counts = {}
        for item in (response.data or []):
            created_at = item.get("created_at")
            if not created_at:
                continue
            try:
                dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                day_key = dt.date().isoformat()
                counts[day_key] = counts.get(day_key, 0) + 1
            except Exception:
                continue

        result = []
        for i in range(days):
            day = (start_date + timedelta(days=i)).isoformat()
            result.append({"date": day, "count": counts.get(day, 0)})

        return jsonify(result), 200
    except Exception as e:
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
    try:
        print("=" * 60)
        print("FETCHING HOMEWORK FROM SUPABASE")
        print("=" * 60)
        response = supabase.table('homework').select('*').execute()
        print(f"Homework count: {len(response.data) if response.data else 0}")
        print("=" * 60)
        return jsonify(response.data)
    except Exception as e:
        print(f"ERROR fetching homework: {str(e)}")
        print(f"ERROR TYPE: {type(e).__name__}")
        print("=" * 60)
        return jsonify({"error": str(e)}), 500

@app.route("/api/homework", methods=["POST"])
def add_homework():
    try:
        data = request.json
        print("=" * 60)
        print("ADDING HOMEWORK TO SUPABASE")
        print("=" * 60)
        print(f"Raw data received: {data}")
        
        # Валидация обязательных полей
        if not data.get('title') or not data.get('description'):
            print("ERROR: Missing title or description")
            print("=" * 60)
            return jsonify({"error": "Title and description are required"}), 400
        
        # Подготовка данных для вставки
        homework_data = {
            "title": data.get('title'),
            "description": data.get('description')
        }
        
        # Добавляем image_url только если он не пустой
        # Это важно, т.к. пустая строка может вызвать ошибку в Supabase
        image_url = data.get('image_url', '').strip()
        if image_url:
            homework_data['image_url'] = image_url
            print(f"Image URL provided: {image_url}")
        else:
            print("No image URL (will be NULL in database)")
        
        print(f"Title: {homework_data['title']}")
        print(f"Description: {homework_data['description']}")
        print(f"Data to insert: {homework_data}")
        
        # Вставляем данные
        response = supabase.table('homework').insert(homework_data).execute()
        
        print(f"SUCCESS: Homework added with ID: {response.data[0].get('id') if response.data else 'unknown'}")
        print("=" * 60)
        return jsonify(response.data[0]), 201
        
    except Exception as e:
        error_str = str(e)
        print(f"ERROR adding homework: {error_str}")
        print(f"ERROR TYPE: {type(e).__name__}")
        
        # Проверяем специфичные ошибки и даём подробные подсказки
        error_message_lower = error_str.lower()
        
        hint = None
        user_friendly_error = "Ошибка при добавлении задания"
        
        if "relation" in error_message_lower and "does not exist" in error_message_lower:
            hint = "Таблица 'homework' не существует в Supabase. Выполните SQL из файла ИСПРАВЛЕНИЕ_ДЗ.md"
            user_friendly_error = "Таблица homework не создана в базе данных"
            print("⚠️  HINT: Table 'homework' DOES NOT EXIST in Supabase!")
            print("⚠️  FIX: Open ИСПРАВЛЕНИЕ_ДЗ.md and run the SQL script")
            
        elif "column" in error_message_lower and "does not exist" in error_message_lower:
            hint = "В таблице homework отсутствует нужная колонка. Пересоздайте таблицу используя SQL из ИСПРАВЛЕНИЕ_ДЗ.md"
            user_friendly_error = "Структура таблицы homework неправильная"
            print("⚠️  HINT: Table 'homework' has wrong structure (missing column)!")
            print("⚠️  FIX: Run SQL from ИСПРАВЛЕНИЕ_ДЗ.md to recreate the table")
            
        elif "row-level security" in error_message_lower or "policy" in error_message_lower:
            hint = "Row Level Security блокирует добавление. Выполните: ALTER TABLE homework DISABLE ROW LEVEL SECURITY;"
            user_friendly_error = "Доступ к базе данных заблокирован (RLS)"
            print("⚠️  HINT: Row Level Security (RLS) is blocking INSERT!")
            print("⚠️  FIX: Disable RLS using SQL from ИСПРАВЛЕНИЕ_ДЗ.md")
            
        elif "duplicate" in error_message_lower or "unique" in error_message_lower:
            hint = "Такое задание уже существует"
            user_friendly_error = "Дубликат задания"
            
        else:
            hint = "Проверьте что таблица homework создана в Supabase. См. файл ИСПРАВЛЕНИЕ_ДЗ.md"
            print("⚠️  HINT: Unknown error. Check that 'homework' table exists and has correct structure")
            print("⚠️  See SUPABASE_HOMEWORK_FIX.md or ИСПРАВЛЕНИЕ_ДЗ.md for setup instructions")
        
        print("=" * 60)
        return jsonify({
            "error": user_friendly_error,
            "hint": hint,
            "details": error_str,
            "fix_file": "ИСПРАВЛЕНИЕ_ДЗ.md"
        }), 500

@app.route("/api/homework/<int:hw_id>", methods=["DELETE"])
def delete_homework(hw_id):
    try:
        print("=" * 60)
        print(f"DELETING HOMEWORK ID: {hw_id}")
        print("=" * 60)
        supabase.table('homework').delete().eq('id', hw_id).execute()
        print(f"SUCCESS: Homework {hw_id} deleted")
        print("=" * 60)
        return jsonify({"message": "Задание удалено"}), 200
    except Exception as e:
        print(f"ERROR deleting homework: {str(e)}")
        print("=" * 60)
        return jsonify({"error": str(e)}), 500

# --- API для AI чата ---
@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """
    Endpoint для общения с AI помощником
    POST /api/ai/chat
    Body: { "message": "Привет, помоги с математикой", "history": [] }
    """
    try:
        print("=" * 60)
        print("AI CHAT REQUEST")
        print("=" * 60)
        
        # Проверяем что AI модель настроена
        if not ai_model:
            print("ERROR: Gemini AI not configured")
            print("=" * 60)
            return jsonify({
                "error": "AI чат не настроен",
                "hint": "Администратор должен добавить GEMINI_API_KEY в .env файл. Получить ключ можно на https://makersuite.google.com/app/apikey"
            }), 503
        
        # Получаем данные из запроса
        data = request.json
        if not data:
            print("ERROR: No JSON data received")
            print("=" * 60)
            return jsonify({"error": "Некорректный запрос"}), 400
        
        user_message = data.get("message", "").strip()
        chat_history = data.get("history", [])
        
        print(f"USER MESSAGE: {user_message}")
        print(f"HISTORY LENGTH: {len(chat_history)} messages")
        
        if not user_message:
            print("ERROR: Message is empty")
            print("=" * 60)
            return jsonify({"error": "Сообщение не может быть пустым"}), 400
        
        # Формируем сообщения для Gemini
        contents = []
        
        # Добавляем системную инструкцию как первое сообщение
        contents.append({
            "role": "user",
            "parts": [{"text": ai_model['system_instruction']}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Понял! Я буду помогать студентам с учебой по этим правилам."}]
        })
        
        # Добавляем историю чата
        for msg in chat_history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        # Добавляем текущее сообщение пользователя
        contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })
        
        # Отправляем запрос в Gemini
        print("Sending message to Gemini...")
        response = ai_model['client'].models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=contents,
            config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )
        
        ai_response = response.text
        
        print(f"AI RESPONSE LENGTH: {len(ai_response)} characters")
        print(f"AI RESPONSE PREVIEW: {ai_response[:100]}...")
        print("=" * 60)
        
        return jsonify({
            "response": ai_response,
            "success": True
        }), 200
        
    except Exception as e:
        error_str = str(e)
        print(f"ERROR in AI chat: {error_str}")
        print(f"ERROR TYPE: {type(e).__name__}")
        print("=" * 60)
        
        # Проверяем специфичные ошибки
        if "API_KEY" in error_str.upper() or "INVALID" in error_str.upper():
            return jsonify({
                "error": "Неверный API ключ",
                "hint": "Проверьте GEMINI_API_KEY в .env файле"
            }), 500
        elif "QUOTA" in error_str.upper() or "LIMIT" in error_str.upper():
            return jsonify({
                "error": "Превышен лимит запросов",
                "hint": "Подождите немного и попробуйте снова"
            }), 429
        else:
            return jsonify({
                "error": "Ошибка AI сервиса",
                "details": error_str
            }), 500

@app.route("/api/ai/status", methods=["GET"])
def ai_status():
    """
    Проверяет доступность AI сервиса
    GET /api/ai/status
    """
    if ai_model:
        return jsonify({
            "available": True,
            "model": "Gemini 2.0 Flash",
            "message": "AI чат готов к работе ✨"
        }), 200
    else:
        return jsonify({
            "available": False,
            "message": "AI чат не настроен. Добавьте GEMINI_API_KEY в .env",
            "hint": "Получить ключ: https://makersuite.google.com/app/apikey"
        }), 503

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
