const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMoi123!";

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "app.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender TEXT NOT NULL CHECK(sender IN ('user','admin')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const adminHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(express.static(path.join(__dirname, "public")));

function requireAdmin(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ error: "Non autorisé" });
  next();
}

function cleanText(value, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

app.post("/api/register", (req, res) => {
  const firstName = cleanText(req.body.firstName, 60);
  const lastName = cleanText(req.body.lastName, 60);
  const age = Number(req.body.age);

  if (!firstName || !lastName || !Number.isInteger(age) || age < 1 || age > 120) {
    return res.status(400).json({ error: "Informations invalides." });
  }

  const result = db.prepare(
    "INSERT INTO users (first_name, last_name, age) VALUES (?, ?, ?)"
  ).run(firstName, lastName, age);

  req.session.userId = result.lastInsertRowid;

  db.prepare(
    "INSERT INTO messages (user_id, sender, content) VALUES (?, 'admin', ?)"
  ).run(result.lastInsertRowid, "Bonjour ! Je suis là. Écris-moi ton message et je te répondrai dès que possible.");

  res.json({ ok: true, userId: result.lastInsertRowid });
});

app.get("/api/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Session absente" });

  const user = db.prepare("SELECT id, first_name, last_name, age FROM users WHERE id = ?")
    .get(req.session.userId);

  if (!user) return res.status(401).json({ error: "Utilisateur introuvable" });

  const messages = db.prepare(`
    SELECT id, sender, content, created_at
    FROM messages
    WHERE user_id = ?
    ORDER BY id ASC
  `).all(user.id);

  res.json({ user, messages });
});

app.post("/api/messages", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Session absente" });

  const content = cleanText(req.body.content, 2000);
  if (!content) return res.status(400).json({ error: "Message vide." });

  db.prepare(
    "INSERT INTO messages (user_id, sender, content) VALUES (?, 'user', ?)"
  ).run(req.session.userId, content);

  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  const password = String(req.body.password ?? "");
  if (!bcrypt.compareSync(password, adminHash)) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }
  req.session.admin = true;
  res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/admin/me", (req, res) => {
  res.json({ authenticated: !!req.session.admin });
});

app.get("/api/admin/users", requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT
      u.id, u.first_name, u.last_name, u.age, u.created_at,
      (SELECT content FROM messages WHERE user_id = u.id ORDER BY id DESC LIMIT 1) AS last_message,
      (SELECT created_at FROM messages WHERE user_id = u.id ORDER BY id DESC LIMIT 1) AS last_message_at
    FROM users u
    ORDER BY u.id DESC
  `).all();

  res.json({ users });
});

app.get("/api/admin/users/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const user = db.prepare(
    "SELECT id, first_name, last_name, age, created_at FROM users WHERE id = ?"
  ).get(id);

  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  const messages = db.prepare(`
    SELECT id, sender, content, created_at
    FROM messages
    WHERE user_id = ?
    ORDER BY id ASC
  `).all(id);

  res.json({ user, messages });
});

app.post("/api/admin/users/:id/messages", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const content = cleanText(req.body.content, 2000);

  if (!db.prepare("SELECT id FROM users WHERE id = ?").get(id)) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
  }
  if (!content) return res.status(400).json({ error: "Message vide." });

  db.prepare(
    "INSERT INTO messages (user_id, sender, content) VALUES (?, 'admin', ?)"
  ).run(id, content);

  res.json({ ok: true });
});

app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  db.prepare("DELETE FROM messages WHERE user_id = ?").run(id);
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
