# Инструкции по установке базы данных

## Требования

- PostgreSQL 12 или выше
- Пользователь с правами на создание баз данных

## Шаги установки

### 1. Создание базы данных

```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE pern_crud;

# Подключение к созданной базе данных
\c pern_crud
```

### 2. Выполнение схемы

```bash
# Выполнение полной схемы базы данных
psql -U postgres -d pern_crud -f database_schema.sql
```

### 3. Проверка установки

```sql
-- Проверка создания таблиц
\dt

-- Проверка данных
SELECT * FROM users;
SELECT * FROM matches;

-- Проверка представления статистики
SELECT * FROM matches_stats;
```

## Структура файлов

```
├── database_schema.sql      # Полная схема базы данных
├── database_er_diagram.md   # ER диаграмма
├── database_setup.md        # Этот файл с инструкциями
└── create_matches_table.sql # Оригинальный файл (устарел)
```

## Конфигурация подключения

В файле `.env` или `server.js` должны быть следующие параметры:

```env
DB_USER=postgres
DB_PASSWORD=1234
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pern_crud
```

## Тестовые данные

После выполнения схемы в базе данных будут созданы:

### Пользователи
- **admin** - администратор (пароль: хешированный)
- **user1** - обычный пользователь
- **user2** - обычный пользователь

### Матчи
- 5 тестовых матчей разных игр
- Разные статусы (finished, upcoming)
- Разные турниры

## Управление базой данных

### Резервное копирование
```bash
pg_dump -U postgres pern_crud > backup.sql
```

### Восстановление
```bash
psql -U postgres pern_crud < backup.sql
```

### Очистка данных
```sql
-- Очистка всех данных (кроме пользователей)
DELETE FROM matches;

-- Сброс автоинкремента
ALTER SEQUENCE matches_id_seq RESTART WITH 1;
```

## Мониторинг

### Проверка производительности
```sql
-- Статистика по таблицам
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('users', 'matches');

-- Размер таблиц
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

### Логи
```bash
# Просмотр логов PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

## Устранение неполадок

### Ошибка подключения
```bash
# Проверка статуса PostgreSQL
sudo systemctl status postgresql

# Перезапуск службы
sudo systemctl restart postgresql
```

### Ошибка прав доступа
```sql
-- Предоставление прав пользователю
GRANT ALL PRIVILEGES ON DATABASE pern_crud TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### Ошибка триггеров
```sql
-- Пересоздание триггеров
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Обновление схемы

При изменении структуры базы данных:

1. Создайте резервную копию
2. Обновите `database_schema.sql`
3. Выполните миграцию
4. Проверьте целостность данных

```bash
# Создание резервной копии
pg_dump -U postgres pern_crud > backup_before_migration.sql

# Выполнение обновленной схемы
psql -U postgres -d pern_crud -f database_schema.sql

# Проверка
psql -U postgres -d pern_crud -c "\dt"
```
