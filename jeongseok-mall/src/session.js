import { getDb } from "./db.js";
import { randomToken } from "./auth.js";
import { mergeGuestCart } from "./cart.js";
import { SESSION_TTL_MS } from "./util.js";

export function createSession(userId = null, data = {}) {
  const database = getDb();
  const id = randomToken(24);
  const csrf = randomToken(16);
  const expires = Date.now() + SESSION_TTL_MS;
  database
    .prepare("INSERT INTO sessions (id, user_id, csrf, json, expires_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, userId, csrf, JSON.stringify(data), expires);
  return { id, userId, csrf, data, destroyed: false };
}

export function loadSession(id) {
  if (!id) return null;
  const database = getDb();
  const row = database.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    database.prepare("DELETE FROM sessions WHERE id = ?").run(id);
    return null;
  }
  let data = {};
  try {
    data = JSON.parse(row.json) || {};
  } catch {
    data = {};
  }
  return { id: row.id, userId: row.user_id, csrf: row.csrf, data, destroyed: false };
}

export function saveSession(session) {
  if (!session || session.destroyed) return;
  getDb()
    .prepare("UPDATE sessions SET user_id = ?, json = ? WHERE id = ?")
    .run(session.userId ?? null, JSON.stringify(session.data || {}), session.id);
}

export function destroySession(session) {
  if (!session) return;
  session.destroyed = true;
  getDb().prepare("DELETE FROM sessions WHERE id = ?").run(session.id);
}

export function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    if (trimmed.slice(0, index) === name) return decodeURIComponent(trimmed.slice(index + 1));
  }
  return "";
}

export function setSessionCookie(res, id) {
  res.cookie("sid", id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res) {
  res.cookie("sid", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function rotateSession(req, res, user) {
  const notes = mergeGuestCart(req.session.id, user.id);
  const data = { ...(req.session.data || {}) };
  if (notes.length) data.flash = { type: "info", message: notes.join(" ") };
  destroySession(req.session);
  const next = createSession(user.id, data);
  req.session = next;
  setSessionCookie(res, next.id);
  return notes;
}

export function loadUser(userId) {
  if (!userId) return null;
  return getDb()
    .prepare("SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?")
    .get(userId);
}
