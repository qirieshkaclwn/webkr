const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: 5432,
  database: "pern_crud",
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Недействительный токен" });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки прав администратора
const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: "Требуются права администратора" });
  }
  next();
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Auth routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Попытка входа:", { username, password });

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    console.log("Результат запроса:", result.rows);

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Неверное имя пользователя или пароль" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    console.log("Проверка пароля:", {
      validPassword,
      storedHash: user.password,
    });

    if (!validPassword) {
      return res
        .status(401)
        .json({ error: "Неверное имя пользователя или пароль" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, is_admin: user.is_admin },
    });
  } catch (err) {
    console.error("Ошибка при входе:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Match routes
// Get all matches
app.get("/api/matches", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM matches ORDER BY match_date DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Create new match (только для админов)
app.post(
  "/api/matches",
  authenticateToken,
  isAdmin,
  upload.single("photo"),
  async (req, res) => {
    try {
      const {
        team1,
        team2,
        team1_score,
        team2_score,
        tournament,
        game_type,
        match_date,
        status,
        description,
      } = req.body;

      const photo = req.file ? req.file.filename : null;
      const created_at = new Date();

      let result;
      try {
        // Пробуем вставить с полями created_at и updated_at
        result = await pool.query(
          `INSERT INTO matches (
          team1, team2, team1_score, team2_score, tournament,
          game_type, match_date, status, description, photo, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11) RETURNING *`,
          [
            team1,
            team2,
            team1_score,
            team2_score,
            tournament,
            game_type,
            match_date,
            status,
            description,
            photo,
            created_at,
          ],
        );
      } catch (insertErr) {
        if (insertErr.code === "42703") {
          // Код ошибки для отсутствующего столбца
          // Если столбец updated_at не существует, выполняем запрос только с created_at
          try {
            result = await pool.query(
              `INSERT INTO matches (
              team1, team2, team1_score, team2_score, tournament,
              game_type, match_date, status, description, photo, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
              [
                team1,
                team2,
                team1_score,
                team2_score,
                tournament,
                game_type,
                match_date,
                status,
                description,
                photo,
                created_at,
              ],
            );
          } catch (err2) {
            // Если и created_at не существует
            if (err2.code === "42703") {
              result = await pool.query(
                `INSERT INTO matches (
                team1, team2, team1_score, team2_score, tournament,
                game_type, match_date, status, description, photo
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [
                  team1,
                  team2,
                  team1_score,
                  team2_score,
                  tournament,
                  game_type,
                  match_date,
                  status,
                  description,
                  photo,
                ],
              );
            } else {
              throw err2;
            }
          }
        } else {
          throw insertErr;
        }
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// Update match (только для админов)
app.put(
  "/api/matches/:id",
  authenticateToken,
  isAdmin,
  upload.single("photo"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        team1,
        team2,
        team1_score,
        team2_score,
        tournament,
        game_type,
        match_date,
        status,
        description,
      } = req.body;

      const photo = req.file ? req.file.filename : req.body.photo;
      const updated_at = new Date();

      let result;
      try {
        // Пробуем обновить с полем updated_at
        result = await pool.query(
          `UPDATE matches SET
          team1 = $1, team2 = $2, team1_score = $3, team2_score = $4,
          tournament = $5, game_type = $6, match_date = $7, status = $8,
          description = $9, photo = $10, updated_at = $11
        WHERE id = $12 RETURNING *`,
          [
            team1,
            team2,
            team1_score,
            team2_score,
            tournament,
            game_type,
            match_date,
            status,
            description,
            photo,
            updated_at,
            id,
          ],
        );
      } catch (updateErr) {
        if (updateErr.code === "42703") {
          // Код ошибки для отсутствующего столбца
          // Если столбец updated_at не существует, выполняем запрос без него
          result = await pool.query(
            `UPDATE matches SET
            team1 = $1, team2 = $2, team1_score = $3, team2_score = $4,
            tournament = $5, game_type = $6, match_date = $7, status = $8,
            description = $9, photo = $10
          WHERE id = $11 RETURNING *`,
            [
              team1,
              team2,
              team1_score,
              team2_score,
              tournament,
              game_type,
              match_date,
              status,
              description,
              photo,
              id,
            ],
          );
        } else {
          throw updateErr; // Если ошибка другая, передаём её дальше
        }
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Матч не найден" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// Delete match (только для админов)
app.delete("/api/matches/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM matches WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Матч не найден" });
    }

    res.json({ message: "Матч успешно удален" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Legacy items routes for backward compatibility
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/items', authenticateToken, isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const photo = req.file ? req.file.filename : null;
    const created_at = new Date();
    
    let result;
    try {
      // Пробуем вставить с полями created_at и updated_at
      result = await pool.query(
        'INSERT INTO items (title, description, photo, created_at, updated_at) VALUES ($1, $2, $3, $4, $4) RETURNING *',
        [title, description, photo, created_at]
      );
    } catch (insertErr) {
      if (insertErr.code === '42703') { // Код ошибки для отсутствующего столбца
        // Если столбец updated_at не существует, выполняем запрос только с created_at
        try {
          result = await pool.query(
            'INSERT INTO items (title, description, photo, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, photo, created_at]
          );
        } catch (err2) {
          // Если и created_at не существует
          if (err2.code === '42703') {
            result = await pool.query(
              'INSERT INTO items (title, description, photo) VALUES ($1, $2, $3) RETURNING *',
              [title, description, photo]
            );
          } else {
            throw err2;
          }
        }
      } else {
        throw insertErr;
      }
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/items/:id', authenticateToken, isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const photo = req.file ? req.file.filename : req.body.photo;
    const updated_at = new Date();
    
    let result;
    try {
      // Пробуем обновить с полем updated_at
      result = await pool.query(
        'UPDATE items SET title = $1, description = $2, photo = $3, updated_at = $4 WHERE id = $5 RETURNING *',
        [title, description, photo, updated_at, id]
      );
    } catch (updateErr) {
      if (updateErr.code === '42703') { // Код ошибки для отсутствующего столбца
        // Если столбец updated_at не существует, выполняем запрос без него
        result = await pool.query(
          'UPDATE items SET title = $1, description = $2, photo = $3 WHERE id = $4 RETURNING *',
          [title, description, photo, id]
        );
      } else {
        throw updateErr; // Если ошибка другая, передаём её дальше
      }
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Элемент не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/items/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Элемент не найден' });
    }
    
    res.json({ message: 'Элемент успешно удален' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
