-- SQL скрипт для настройки Supabase
-- Выполните этот код в SQL Editor вашего проекта Supabase

-- 1. Создание таблицы homework_bot
CREATE TABLE IF NOT EXISTS homework_bot (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Включение Row Level Security (RLS)
ALTER TABLE homework_bot ENABLE ROW LEVEL SECURITY;

-- 3. Политика для публичного чтения (для веб-страницы)
CREATE POLICY IF NOT EXISTS "Публичное чтение" 
ON homework_bot
FOR SELECT
USING (true);

-- 4. Политика для вставки (для бота через service_role key)
CREATE POLICY IF NOT EXISTS "Запись через сервис" 
ON homework_bot
FOR INSERT
WITH CHECK (true);

-- 5. Создание индекса для быстрой сортировки по дате
CREATE INDEX IF NOT EXISTS idx_homework_created_at 
ON homework_bot(created_at DESC);

-- Проверка: вставить тестовую запись
INSERT INTO homework_bot (title, description)
VALUES ('Тестовое задание', 'Это тестовое задание для проверки работы системы');

-- Проверка: получить все записи
SELECT * FROM homework_bot ORDER BY created_at DESC;
