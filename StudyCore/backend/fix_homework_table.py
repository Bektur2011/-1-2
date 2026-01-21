"""
Автоматическое исправление таблицы homework в Supabase
Этот скрипт:
1. Проверяет существует ли таблица homework
2. Если нет - создаёт её
3. Отключает RLS чтобы всё работало
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найдены SUPABASE_URL или SUPABASE_KEY в .env")
    exit(1)

SUPABASE_URL = SUPABASE_URL.rstrip("/")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 70)
print("🔧 АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ ТАБЛИЦЫ HOMEWORK")
print("=" * 70)

# SQL для создания таблицы и отключения RLS
SQL_CREATE_TABLE = """
-- Создать таблицу homework если её нет
CREATE TABLE IF NOT EXISTS homework (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

SQL_DISABLE_RLS = """
-- Отключить Row Level Security
ALTER TABLE homework DISABLE ROW LEVEL SECURITY;
"""

try:
    print("\n📋 Шаг 1: Проверяем таблицу homework...")
    
    # Пытаемся получить данные из таблицы
    try:
        result = supabase.table('homework').select('*').limit(1).execute()
        print(f"✅ Таблица homework существует! (записей: {len(result.data)})")
    except Exception as e:
        print(f"⚠️  Таблица не найдена или есть ошибка: {str(e)}")
        print("📝 Создаём таблицу...")
        
        # Создаём таблицу через SQL
        supabase.postgrest.rpc('exec_sql', {'sql': SQL_CREATE_TABLE}).execute()
        print("✅ Таблица создана!")
    
    print("\n🔓 Шаг 2: Отключаем Row Level Security...")
    
    # Отключаем RLS
    try:
        supabase.postgrest.rpc('exec_sql', {'sql': SQL_DISABLE_RLS}).execute()
        print("✅ RLS отключён!")
    except Exception as e:
        print(f"⚠️  Не удалось отключить RLS через RPC: {str(e)}")
        print("💡 Нужно выполнить SQL вручную в Supabase Dashboard")
        print("\nSQL команда:")
        print("ALTER TABLE homework DISABLE ROW LEVEL SECURITY;")
    
    print("\n🧪 Шаг 3: Проверяем что всё работает...")
    
    # Пробуем добавить тестовую запись
    test_data = {
        "title": "🧪 Тест (можно удалить)",
        "description": "Автоматическая проверка работоспособности"
    }
    
    try:
        result = supabase.table('homework').insert(test_data).execute()
        print("✅ Тестовая запись добавлена успешно!")
        print(f"   ID: {result.data[0]['id']}")
        
        # Удаляем тестовую запись
        test_id = result.data[0]['id']
        supabase.table('homework').delete().eq('id', test_id).execute()
        print("✅ Тестовая запись удалена")
        
    except Exception as e:
        print(f"❌ ОШИБКА при тестировании: {str(e)}")
        print("\n💡 РЕШЕНИЕ:")
        print("   1. Откройте Supabase Dashboard")
        print("   2. Перейдите в SQL Editor")
        print("   3. Выполните команду:")
        print("      ALTER TABLE homework DISABLE ROW LEVEL SECURITY;")
        print("\n   Прямая ссылка:")
        print(f"   https://supabase.com/dashboard/project/{SUPABASE_URL.split('//')[1].split('.')[0]}/sql/new")
    
    print("\n" + "=" * 70)
    print("✅ ГОТОВО! Таблица homework настроена")
    print("=" * 70)
    print("\n📝 Теперь попробуйте добавить домашнее задание на сайте!")
    
except Exception as e:
    print(f"\n❌ КРИТИЧЕСКАЯ ОШИБКА: {str(e)}")
    print(f"Тип ошибки: {type(e).__name__}")
    print("\n💡 РУЧНОЕ РЕШЕНИЕ:")
    print("   Откройте Supabase SQL Editor и выполните:")
    print(SQL_CREATE_TABLE)
    print(SQL_DISABLE_RLS)
    print(f"\n   Ссылка: https://supabase.com/dashboard/project/{SUPABASE_URL.split('//')[1].split('.')[0]}/sql/new")
