# Схема базы данных и развёртывание

Этот файл описывает структуру базы данных, SQL-скрипты и шаги для запуска проекта (backend + frontend).

## Структура данных

Таблицы:

- `users`
  - `id` SERIAL PRIMARY KEY
  - `username` VARCHAR(100) UNIQUE NOT NULL
  - `password` VARCHAR(255) NOT NULL (хранится хеш)
  - `is_admin` BOOLEAN DEFAULT FALSE

- `items` (теперь представляет рецепты печенья)
  - `id` SERIAL PRIMARY KEY
  - `title` VARCHAR(255) NOT NULL
  - `description` TEXT
  - `ingredients` TEXT — список ингредиентов. Можно хранить как CSV (например: "мука, сахар, масло") или как JSON-строку. Текущая реализация ожидает простую строку.
  - `photo` VARCHAR(255) — имя загруженного файла
  - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT now()
  - `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT now()

Файл со скриптами: `sql/create_tables.sql` — создаёт таблицы и триггер для обновления `updated_at`.

## Развёртывание локально (Windows / PowerShell)

1. Установите PostgreSQL и создайте базу данных (если ещё не создана). По умолчанию проект подключается к базе `pern_crud`.

   В PowerShell пример:

   ```powershell
   psql -U postgres -c "CREATE DATABASE pern_crud;"
   ```

2. Выполните SQL-скрипт для создания таблиц (или выполните содержимое файла `sql/create_tables.sql` в psql):

   ```powershell
   psql -U postgres -d pern_crud -f .\sql\create_tables.sql
   ```

3. Установите Node.js зависимости и запустите сервер и клиент:

   ```powershell
   # корень проекта
   npm install

   # установить зависимости клиента
   cd client
   npm install
   cd ..

   # запустить сервер (в новом терминале) и клиент (в другом)
   npm run dev
   npm run client
   ```

4. По умолчанию сервер слушает порт 5000, клиент — 3000. Откройте http://localhost:3000

## Примечания о миграции

Если у вас уже есть таблица `items` без поля `ingredients`, можно добавить столбец:

```sql
ALTER TABLE items ADD COLUMN ingredients TEXT;
```

Если вы хотите хранить ингредиенты как массив/JSON, можно изменить тип:

```sql
ALTER TABLE items ALTER COLUMN ingredients TYPE jsonb USING to_jsonb(string_to_array(ingredients, ','));
```

После изменения схемы серверные запросы к полю `ingredients` останутся такими же (они будут работать с JSON-строкой), но фронтенд может быть адаптирован для отображения массивов.
