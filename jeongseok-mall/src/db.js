import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./auth.js";
import { nowIso, optionLabel } from "./util.js";

const DEFAULT_NOTICE =
  "배송이 시작된 주문은 이 화면에서 취소할 수 없습니다. 반품과 교환은 고객센터로 문의해 주세요. 연락처와 운영 시간은 운영 설정에서 바꿉니다.";

let db;

export function getDb() {
  if (!db) throw new Error("database is not ready");
  return db;
}

export function initDb(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 3000;
  `);
  migrate(db);
  seed(db);
  return db;
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('selling', 'hidden', 'stopped')),
      has_variants INTEGER NOT NULL CHECK(has_variants IN (0, 1)),
      price INTEGER,
      stock INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS variants (
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      color TEXT NOT NULL DEFAULT '',
      size TEXT NOT NULL DEFAULT '',
      option_label TEXT NOT NULL,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL CHECK(role IN ('customer', 'admin')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient TEXT NOT NULL,
      phone TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      address1 TEXT NOT NULL,
      address2 TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT UNIQUE,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY,
      cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      line_key TEXT NOT NULL,
      qty INTEGER NOT NULL,
      seen_price INTEGER NOT NULL,
      UNIQUE(cart_id, line_key)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      order_no TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      buyer_name TEXT NOT NULL DEFAULT '',
      buyer_phone TEXT NOT NULL,
      buyer_email TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      merchandise_total INTEGER NOT NULL,
      shipping_fee INTEGER NOT NULL,
      shipping_base INTEGER NOT NULL,
      shipping_remote INTEGER NOT NULL,
      total INTEGER NOT NULL,
      recipient TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      address1 TEXT NOT NULL,
      address2 TEXT NOT NULL,
      memo TEXT NOT NULL DEFAULT '',
      tracking_no TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      cancelled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER,
      variant_id INTEGER,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      option_label TEXT NOT NULL DEFAULT '',
      unit_price INTEGER NOT NULL,
      qty INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_events (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      kind TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      csrf TEXT NOT NULL,
      json TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkout_keys (
      key TEXT PRIMARY KEY,
      order_id INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_list ON products(status, created_at, id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, id);
  `);
}

function seed(database) {
  const admin = database.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!admin) {
    database.prepare(
      `INSERT INTO users (email, password_hash, name, phone, role, created_at)
       VALUES (?, ?, ?, '', 'admin', ?)`,
    ).run("admin@jeongseok.local", hashPassword("jeongseok-admin"), "정석몰 운영", nowIso());
  }

  const settings = database.prepare("SELECT COUNT(*) AS n FROM settings").get().n;
  if (settings === 0) {
    const insert = database.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    insert.run("free_shipping_threshold", "50000");
    insert.run("base_shipping_fee", "3000");
    insert.run("remote_surcharge", "4000");
    insert.run("remote_prefixes", JSON.stringify(["63", "402"]));
    insert.run("customer_center_notice", DEFAULT_NOTICE);
  }

  const categories = database.prepare("SELECT COUNT(*) AS n FROM categories").get().n;
  if (categories > 0) return;

  const createdAt = nowIso();
  const insertCategory = database.prepare(
    "INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)",
  );
  const cat1 = Number(insertCategory.run("분류 1", "cat-1", 1).lastInsertRowid);
  const cat2 = Number(insertCategory.run("분류 2", "cat-2", 2).lastInsertRowid);
  const cat3 = Number(insertCategory.run("분류 3", "cat-3", 3).lastInsertRowid);

  const insertProduct = database.prepare(
    `INSERT INTO products
      (category_id, brand, name, description, status, has_variants, price, stock, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertVariant = database.prepare(
    `INSERT INTO variants (product_id, color, size, option_label, price, stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  function simple(categoryId, brand, name, description, price, stock, status = "selling") {
    insertProduct.run(categoryId, brand, name, description, status, 0, price, stock, createdAt);
  }

  function withVariants(categoryId, brand, name, description, rows, status = "selling") {
    const id = Number(
      insertProduct.run(categoryId, brand, name, description, status, 1, null, null, createdAt).lastInsertRowid,
    );
    for (const row of rows) {
      insertVariant.run(id, row.color, row.size, optionLabel(row.color, row.size), row.price, row.stock);
    }
  }

  simple(
    cat1,
    "한결",
    "매일 면 수건 2장",
    "얼굴을 닦기 좋은 두께의 면 수건입니다. 색은 아이보리 한 가지입니다.",
    15000,
    40,
  );
  withVariants(cat1, "보람", "데일리 텀블러", "350ml. 하루 한 병 들고 다니기 좋은 크기입니다.", [
    { color: "아이보리", size: "", price: 24000, stock: 15 },
    { color: "네이비", size: "", price: 24000, stock: 0 },
  ]);
  withVariants(
    cat2,
    "새솔",
    "코튼 반팔 티셔츠",
    "면 반팔입니다. 색과 사이즈를 고른 뒤 담아 주세요.",
    [
      { color: "화이트", size: "S", price: 32000, stock: 8 },
      { color: "화이트", size: "M", price: 32000, stock: 10 },
      { color: "화이트", size: "L", price: 32000, stock: 4 },
      { color: "차콜", size: "S", price: 32000, stock: 0 },
      { color: "차콜", size: "M", price: 32000, stock: 6 },
      { color: "차콜", size: "L", price: 32000, stock: 3 },
    ],
  );
  simple(cat2, "한결", "가벼운 에코백", "장보기와 외출에 같이 쓰기 좋은 가벼운 가방입니다.", 18000, 25);
  simple(cat2, "한결", "리넨 파우치", "작은 소지품을 넣기 좋은 파우치입니다. 지금은 재고가 없습니다.", 13000, 0);
  simple(cat3, "보람", "무선 노트 3권", "줄 없는 노트 세 권입니다. 표지는 베이지입니다.", 9000, 60);
  withVariants(cat3, "새솔", "부드러운 젤펜", "손에 남는 잉크가 적은 젤펜입니다. 색을 골라 주세요.", [
    { color: "블랙", size: "", price: 6000, stock: 20 },
    { color: "블루", size: "", price: 7000, stock: 12 },
    { color: "레드", size: "", price: 7000, stock: 0 },
  ]);
  simple(
    cat1,
    "보람",
    "준비 중인 담요",
    "판매를 멈추어 둔 상품입니다. 목록에 나오면 안 됩니다.",
    35000,
    5,
    "stopped",
  );
}

export function getSettings(database = getDb()) {
  const rows = database.prepare("SELECT key, value FROM settings").all();
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  let prefixes = [];
  try {
    prefixes = JSON.parse(map.remote_prefixes || "[]");
  } catch {
    prefixes = [];
  }
  return {
    freeShippingThreshold: Number(map.free_shipping_threshold ?? 50000),
    baseShippingFee: Number(map.base_shipping_fee ?? 3000),
    remoteSurcharge: Number(map.remote_surcharge ?? 4000),
    remotePrefixes: Array.isArray(prefixes) ? prefixes.map(String) : [],
    customerCenterNotice: map.customer_center_notice || DEFAULT_NOTICE,
  };
}

export function saveSettings(database, settings) {
  const update = database.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  update.run("free_shipping_threshold", String(settings.freeShippingThreshold));
  update.run("base_shipping_fee", String(settings.baseShippingFee));
  update.run("remote_surcharge", String(settings.remoteSurcharge));
  update.run("remote_prefixes", JSON.stringify(settings.remotePrefixes));
  update.run("customer_center_notice", settings.customerCenterNotice);
}
