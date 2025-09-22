-- Создание таблицы для киберспортивных матчей
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

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_game_type ON matches(game_type);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament);

-- Добавление комментариев к таблице и столбцам
COMMENT ON TABLE matches IS 'Таблица для хранения информации о киберспортивных матчах';
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

-- Вставка тестовых данных
INSERT INTO matches (team1, team2, team1_score, team2_score, tournament, game_type, match_date, status, description) VALUES
('Natus Vincere', 'Team Liquid', 16, 14, 'ESL Pro League Season 18', 'CS:GO', '2024-01-15 20:00:00', 'finished', 'Захватывающий матч в финале турнира'),
('Team Spirit', 'G2 Esports', 2, 1, 'The International 2024', 'Dota 2', '2024-01-20 18:00:00', 'finished', 'Упорная борьба в полуфинале'),
('Fnatic', 'Cloud9', 0, 0, 'Valorant Champions 2024', 'Valorant', '2024-01-25 19:00:00', 'upcoming', 'Ожидаемый матч между топ-командами'),
('T1', 'Gen.G', 0, 0, 'LCK Spring 2024', 'League of Legends', '2024-01-30 17:00:00', 'upcoming', 'Корейское противостояние'),
('FaZe Clan', 'Astralis', 0, 0, 'BLAST Premier 2024', 'CS:GO', '2024-02-05 21:00:00', 'upcoming', 'Классическое противостояние в CS:GO');

-- Обновление счетов для завершенных матчей
UPDATE matches SET team1_score = 16, team2_score = 14 WHERE team1 = 'Natus Vincere' AND team2 = 'Team Liquid';
UPDATE matches SET team1_score = 2, team2_score = 1 WHERE team1 = 'Team Spirit' AND team2 = 'G2 Esports';
