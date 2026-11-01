export const MAX_LINE_QTY = 99;
export const PAGE_SIZE = 8;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function won(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0원";
  return `${n.toLocaleString("ko-KR")}원`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function formatWhen(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function seoulDayStamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts.replace(/-/g, "");
}

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function textToHtml(value) {
  return esc(value).replace(/\n/g, "<br>");
}

export function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function validPhone(value) {
  return /^0\d{8,10}$/.test(normalizePhone(value));
}

export function formatPhone(value) {
  const d = normalizePhone(value);
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10 && d.startsWith("02")) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 9 && d.startsWith("02")) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return d;
}

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function validPostal(value) {
  return /^\d{5}$/.test(String(value ?? "").trim());
}

export function parseQty(value) {
  const raw = String(value ?? "").trim();
  if (!/^\d+$/.test(raw)) return null;
  return Number(raw);
}

export function parseMoney(value) {
  const raw = String(value ?? "").trim().replace(/,/g, "");
  if (!/^\d+$/.test(raw)) return null;
  return Number(raw);
}

export function likeContains(value) {
  return `%${String(value).replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

export function optionLabel(color, size) {
  return [color, size].map((part) => String(part ?? "").trim()).filter(Boolean).join(" / ");
}

export function clip(value, max) {
  const text = String(value ?? "").trim();
  if (text.length > max) return null;
  return text;
}

export const STATUS_LABEL = {
  paid: "결제 완료",
  preparing: "상품 준비 중",
  shipping: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소됨",
  cancel_error: "취소 처리 오류",
};

export const PAYMENT_LABEL = {
  card: "카드",
  easypay: "간편결제",
};
