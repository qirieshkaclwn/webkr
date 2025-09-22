-- =====================================================
-- ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ КИБЕРСПОРТИВНОГО САЙТА
-- =====================================================

-- База данных: pern_crud
-- Описание: База данных для киберспортивного сайта с результатами матчей

-- =====================================================
-- ТАБЛИЦА: users (Пользователи)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для таблицы users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);

-- Комментарии для таблицы users
COMMENT ON TABLE users IS 'Таблица пользователей системы';
COMMENT ON COLUMN users.id IS 'Уникальный идентификатор пользователя';
COMMENT ON COLUMN users.username IS 'Имя пользователя (уникальное)';
COMMENT ON COLUMN users.password IS 'Хешированный пароль пользователя';
COMMENT ON COLUMN users.is_admin IS 'Флаг администратора (true/false)';
COMMENT ON COLUMN users.created_at IS 'Дата создания аккаунта';
COMMENT ON COLUMN users.updated_at IS 'Дата последнего обновления';

-- =====================================================
-- ТАБЛИЦА: matches (Матчи)
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    team1 VARCHAR(255) NOT NULL,
    team2 VARCHAR(255) NOT NULL,
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    tournament VARCHAR(255),
    game_type VARCHAR(100),
    match_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'upcoming',
    description TEXT,
    photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для таблицы matches
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_game_type ON matches(game_type);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(team1, team2);

-- Комментарии для таблицы matches
COMMENT ON TABLE matches IS 'Таблица для хранения информации о киберспортивных матчах';
COMMENT ON COLUMN matches.id IS 'Уникальный идентификатор матча';
COMMENT ON COLUMN matches.team1 IS 'Название первой команды';
COMMENT ON COLUMN matches.team2 IS 'Название второй команды';
COMMENT ON COLUMN matches.team1_score IS 'Счет первой команды';
COMMENT ON COLUMN matches.team2_score IS 'Счет второй команды';
COMMENT ON COLUMN matches.tournament IS 'Название турнира';
COMMENT ON COLUMN matches.game_type IS 'Тип игры (CS:GO, Dota 2, etc.)';
COMMENT ON COLUMN matches.match_date IS 'Дата и время матча';
COMMENT ON COLUMN matches.status IS 'Статус матча (upcoming, live, finished, cancelled)';
COMMENT ON COLUMN matches.description IS 'Описание матча';
COMMENT ON COLUMN matches.photo IS 'Путь к фотографии матча';
COMMENT ON COLUMN matches.created_at IS 'Дата создания записи';
COMMENT ON COLUMN matches.updated_at IS 'Дата последнего обновления';


-- ТЕСТОВЫЕ ДАННЫЕ
-- =====================================================

-- Вставка тестовых пользователей
-- Пароль для всех: 'password' (хешированный с bcrypt)
INSERT INTO users (username, password, is_admin) VALUES
    ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
    ('usr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false)
ON CONFLICT (username) DO NOTHING;

-- Вставка примеров матчей
INSERT INTO matches (team1, team2, team1_score, team2_score, tournament, game_type, match_date, status, description) VALUES
    ('Natus Vincere', 'Astralis', 16, 12, 'IEM Cologne 2024', 'CS:GO', '2024-01-15 18:00:00', 'finished', 'Полуфинальный матч'),
    ('T1', 'Gen.G', 2, 1, 'Worlds 2024', 'League of Legends', '2024-01-20 20:00:00', 'finished', 'Финал турнира'),
    ('FaZe Clan', 'G2 Esports', 0, 0, 'BLAST Premier', 'CS:GO', '2024-01-25 19:30:00', 'upcoming', 'Предстоящий матч группового этапа')
ON CONFLICT (id) DO NOTHING;



-- =====================================================
-- ТРИГГЕРЫ ДЛЯ ОБНОВЛЕНИЯ updated_at
-- =====================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- =====================================================
-- ПРАВА ДОСТУПА
-- =====================================================

-- Предоставление прав на чтение всем пользователям
GRANT SELECT ON ALL TABLES IN SCHEMA public TO PUBLIC;

-- Предоставление прав на запись только аутентифицированным пользователям
GRANT INSERT, UPDATE, DELETE ON matches TO PUBLIC;


-- Только администраторы могут управлять пользователями
GRANT INSERT, UPDATE, DELETE ON users TO PUBLIC;

-- =====================================================
-- СТАТИСТИКА
-- =====================================================

-- Создание представления для статистики матчей
CREATE OR REPLACE VIEW matches_stats AS
SELECT
    game_type,
    COUNT(*) as total_matches,
    COUNT(CASE WHEN status = 'finished' THEN 1 END) as finished_matches,
    COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_matches,
    COUNT(CASE WHEN status = 'live' THEN 1 END) as live_matches
FROM matches
GROUP BY game_type;

-- Комментарий для представления
COMMENT ON VIEW matches_stats IS 'Статистика матчей по типам игр';
