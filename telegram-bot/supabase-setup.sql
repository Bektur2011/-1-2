CREATE TABLE IF NOT EXISTS homework (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Публичное чтение" 
ON homework FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Запись через сервис" 
ON homework FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_homework_created_at 
ON homework(created_at DESC);

INSERT INTO homework (title, description)
VALUES ('Тестовое задание', 'Это тестовое задание для проверки');

SELECT * FROM homework ORDER BY created_at DESC;
