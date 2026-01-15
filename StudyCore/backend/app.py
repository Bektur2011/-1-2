from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Получить абсолютный путь к папке data
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_users():
    try:
        users_file = os.path.join(DATA_DIR, "users.json")
        with open(users_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

def load_homework():
    homework_file = os.path.join(DATA_DIR, "homework.json")
    if os.path.exists(homework_file):
        try:
            with open(homework_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def save_homework(homework_list):
    homework_file = os.path.join(DATA_DIR, "homework.json")
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(homework_file, "w", encoding="utf-8") as f:
        json.dump(homework_list, f, ensure_ascii=False, indent=2)

# Проверка работоспособности сервера
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        password = data.get("password", "").strip()

        users = load_users()

        for user in users:
            if user["password"] == password:
                return jsonify({
                    "success": True,
                    "name": user["name"],
                    "role": user["role"]
                })

        return jsonify({
            "success": False,
            "message": "Неверный пароль"
        }), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/users", methods=["GET"])
def get_users():
    try:
        users = load_users()
        return jsonify(users), 200
    except Exception as e:
        print(f"Get users error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/homework", methods=["GET"])
def get_homework_list():
    try:
        homework = load_homework()
        return jsonify(homework), 200
    except Exception as e:
        print(f"Get homework error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/homework", methods=["POST"])
def add_homework():
    try:
        data = request.json
        homework_list = load_homework()
        
        new_homework = {
            "id": max([h.get("id", 0) for h in homework_list], default=0) + 1,
            "title": data.get("title"),
            "description": data.get("description")
        }
        
        homework_list.append(new_homework)
        save_homework(homework_list)
        
        return jsonify(new_homework), 201
    except Exception as e:
        print(f"Add homework error: {e}")
        return jsonify({"error": str(e)}), 500

# Обработка 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found", "path": request.path}), 404

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
