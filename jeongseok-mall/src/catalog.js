import { getDb } from "./db.js";
import { PAGE_SIZE, likeContains } from "./util.js";

const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug,
    CASE WHEN p.has_variants = 1 THEN (SELECT MIN(v.price) FROM variants v WHERE v.product_id = p.id)
         ELSE p.price END AS rep_price,
    CASE WHEN p.has_variants = 1 THEN (SELECT COUNT(DISTINCT v.price) FROM variants v WHERE v.product_id = p.id)
         ELSE 1 END AS price_count,
    CASE WHEN p.has_variants = 1 THEN (SELECT COALESCE(SUM(v.stock), 0) FROM variants v WHERE v.product_id = p.id)
         ELSE COALESCE(p.stock, 0) END AS total_stock
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

const SORTS = {
  new: "p.created_at DESC, p.id DESC",
  price_asc: "rep_price ASC, p.id DESC",
  price_desc: "rep_price DESC, p.id DESC",
};

export function listCategories() {
  return getDb().prepare("SELECT id, name, slug FROM categories ORDER BY sort_order, id").all();
}

export function categoryBySlug(slug) {
  return getDb().prepare("SELECT * FROM categories WHERE slug = ?").get(slug);
}

export function listProducts({ categoryId = null, query = "", sort = "new", page = 1, pageSize = PAGE_SIZE } = {}) {
  const where = ["p.status = 'selling'"];
  const params = [];
  if (categoryId) {
    where.push("p.category_id = ?");
    params.push(categoryId);
  }
  if (query) {
    where.push("p.name LIKE ? ESCAPE '\\'");
    params.push(likeContains(query));
  }
  const order = SORTS[sort] || SORTS.new;
  const database = getDb();
  const total = database
    .prepare(`SELECT COUNT(*) AS n FROM products p WHERE ${where.join(" AND ")}`)
    .get(...params).n;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const items = database
    .prepare(
      `${PRODUCT_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, (safePage - 1) * pageSize);
  return { items, total, page: safePage, pageCount, pageSize };
}

export function getProduct(id) {
  return getDb().prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id);
}

export function getVariants(productId) {
  return getDb()
    .prepare("SELECT * FROM variants WHERE product_id = ? ORDER BY id")
    .all(productId);
}

export function productSvg(product) {
  const palette = ["#1f4d3a", "#3d4c68", "#6b4334", "#3e5348", "#53445f", "#2c4f55"];
  const bg = palette[(product.id || 0) % palette.length];
  const brand = escapeXml(product.brand || "");
  const name = escapeXml(truncate(product.name || "", 18));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="${bg}"/>
  <rect x="56" y="56" width="688" height="688" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="2"/>
  <text x="88" y="360" fill="#ffffff" fill-opacity="0.82" font-size="32" font-family="sans-serif">${brand}</text>
  <text x="88" y="430" fill="#ffffff" font-size="48" font-family="sans-serif">${name}</text>
</svg>`;
}

function truncate(value, max) {
  const chars = Array.from(value);
  if (chars.length <= max) return value;
  return `${chars.slice(0, max - 1).join("")}…`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
