#!/usr/bin/env python3
"""
Запускает Flask сервер и Telegram бота одновременно
Runs both Flask server and Telegram bot simultaneously
"""
import os
import sys
import subprocess
import signal
import time
from threading import Thread

# Процессы для отслеживания
processes = []

def signal_handler(sig, frame):
    """Обработчик сигналов для корректного завершения"""
    print("\n🛑 Получен сигнал завершения, останавливаем сервисы...")
    for process in processes:
        if process and process.poll() is None:
            print(f"Останавливаем процесс {process.pid}...")
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"Принудительно завершаем процесс {process.pid}...")
                process.kill()
    sys.exit(0)

# Регистрируем обработчики сигналов
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def run_flask():
    """Запускает Flask сервер"""
    print("🌐 Запускаем Flask сервер...")
    port = os.environ.get("PORT", "5000")
    
    # Запускаем Flask приложение
    flask_process = subprocess.Popen(
        [sys.executable, "app.py"],
        env={**os.environ, "PORT": port},
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    processes.append(flask_process)
    
    # Выводим логи Flask
    for line in flask_process.stdout:
        print(f"[FLASK] {line.strip()}")
    
    flask_process.wait()
    print("❌ Flask сервер остановлен")

def run_telegram_bot():
    """Запускает Telegram бота"""
    print("🤖 Запускаем Telegram бота...")
    
    # Даём Flask время запуститься первым
    time.sleep(2)
    
    # Проверяем что .env файл существует
    bot_env_path = os.path.join("telegram-bot", ".env")
    if not os.path.exists(bot_env_path):
        print("⚠️  WARNING: telegram-bot/.env не найден!")
        print("⚠️  Бот не будет запущен. Создайте .env файл по примеру .env.example")
        return
    
    # Запускаем бота
    bot_process = subprocess.Popen(
        ["node", "bot.js"],
        cwd="telegram-bot",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    processes.append(bot_process)
    
    # Выводим логи бота
    for line in bot_process.stdout:
        print(f"[BOT] {line.strip()}")
    
    bot_process.wait()
    print("❌ Telegram бот остановлен")

def main():
    """Главная функция"""
    print("=" * 60)
    print("🚀 STUDYCORE - Запуск всех сервисов")
    print("=" * 60)
    print("Сервисы:")
    print("  1. Flask Backend + Frontend (порт {})".format(os.environ.get("PORT", "5000")))
    print("  2. Telegram Bot")
    print("=" * 60)
    
    # Создаём потоки для каждого сервиса
    flask_thread = Thread(target=run_flask, daemon=True)
    bot_thread = Thread(target=run_telegram_bot, daemon=True)
    
    # Запускаем потоки
    flask_thread.start()
    bot_thread.start()
    
    print("✅ Все сервисы запущены!")
    print("=" * 60)
    
    # Ждём завершения потоков
    try:
        flask_thread.join()
        bot_thread.join()
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()
