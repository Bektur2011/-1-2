# 🚀 Быстрый старт

## 1. Установка

```bash
cd telegram-bot
npm install
```

## 2. Настройка .env

Откройте файл `.env` и замените:

```env
BOT_TOKEN=8579840218:AAF6OJIjZDxM9i8HCZ_EOzMGGDOVsbH_XsY
SUPABASE_URL=https://jqfifytmlpofxzwkeavm.supabase.co
SUPABASE_KEY=ваш_service_role_key_от_supabase
ADMIN_IDS=ваш_telegram_id
```

**Как получить данные:**

1. **SUPABASE_KEY** - откройте Supabase → Settings → API → скопируйте `service_role` key
2. **ADMIN_IDS** - откройте [@userinfobot](https://t.me/userinfobot) в Telegram, получите свой ID

## 3. Создание таблицы в Supabase

Откройте SQL Editor в Supabase и выполните:

```sql
CREATE TABLE homework (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Публичное чтение" 
ON homework FOR SELECT USING (true);

CREATE POLICY "Запись через сервис" 
ON homework FOR INSERT WITH CHECK (true);
```

## 4. Запуск бота

```bash
npm start
```

Должно появиться:
```
🤖 Бот запущен и готов к работе!
```

## 5. Настройка веб-страницы

Откройте `public/index.html` и замените на строке 248:

```javascript
const SUPABASE_ANON_KEY = 'ваш_anon_public_key';
```

**Где взять:** Supabase → Settings → API → `anon public` key

## ✅ Готово!

Теперь можно использовать бота:

- `/start` - приветствие и инструкция
- `/add Математика | Решить задачи 1-10` - добавить задание
- `/list` - показать все задания

Веб-страница: откройте `public/index.html` в браузере.
