import { randomBytes } from "node:crypto";
import { getDb, getSettings } from "./db.js";
import { quoteShipping } from "./shipping.js";
import { nowIso, seoulDayStamp } from "./util.js";

const CANCELABLE = new Set(["paid", "preparing"]);
const NEXT_STATUS = {
  paid: ["preparing"],
  preparing: ["shipping"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
  cancel_error: [],
};

export function canCustomerCancel(status) {
  return CANCELABLE.has(status);
}

export function assessCardPayment(cardNumber) {
  const digits = String(cardNumber ?? "").replace(/\D/g, "");
  if (!/^\d{15,16}$/.test(digits)) {
    return { ok: false, field: "card_number", error: "카드 번호를 확인해 주세요." };
  }
  if (digits.endsWith("0000")) {
    return {
      ok: false,
      declined: true,
      error: "카드 승인이 거절되었습니다. 다른 카드나 간편결제를 이용해 주세요. 주문은 만들어지지 않았습니다.",
    };
  }
  return { ok: true };
}

function readSellable(database, line) {
  const product = database.prepare("SELECT * FROM products WHERE id = ?").get(line.productId);
  if (!product || product.status !== "selling") return null;
  if (line.variantId) {
    if (!product.has_variants) return null;
    const variant = database
      .prepare("SELECT * FROM variants WHERE id = ? AND product_id = ?")
      .get(line.variantId, product.id);
    if (!variant) return null;
    return { price: variant.price, stock: variant.stock };
  }
  if (product.has_variants) return null;
  return { price: product.price, stock: product.stock ?? 0 };
}

function uniqueOrderNo(database) {
  const day = seoulDayStamp();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const no = `JS${day}-${randomBytes(3).toString("hex").toUpperCase()}`;
    if (!database.prepare("SELECT 1 FROM orders WHERE order_no = ?").get(no)) return no;
  }
  throw new Error("could not allocate an order number");
}

export function placeOrder(input) {
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    return { ok: false, code: "empty" };
  }
  if (!/^[a-f0-9]{32}$/.test(input.idemKey || "")) {
    return { ok: false, code: "idem" };
  }
  const database = getDb();
  database.exec("BEGIN IMMEDIATE");
  try {
    const prev = database.prepare("SELECT order_id FROM checkout_keys WHERE key = ?").get(input.idemKey);
    if (prev) {
      database.exec("COMMIT");
      const order = database.prepare("SELECT id, order_no, total FROM orders WHERE id = ?").get(prev.order_id);
      return { ok: true, replay: true, orderId: order.id, orderNo: order.order_no, total: order.total };
    }

    for (const line of input.lines) {
      const current = readSellable(database, line);
      if (!current) {
        database.exec("ROLLBACK");
        return { ok: false, code: "unavailable", items: [line] };
      }
      if (current.price !== line.unitPrice) {
        database.exec("ROLLBACK");
        return { ok: false, code: "mismatch" };
      }
      if (current.stock < line.qty) {
        database.exec("ROLLBACK");
        return {
          ok: false,
          code: "stock",
          items: [{ name: line.name, optionLabel: line.optionLabel, stock: current.stock }],
        };
      }
    }

    const merchandise = input.lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
    const shipping = quoteShipping(merchandise, input.postalCode, getSettings(database));
    const total = merchandise + shipping.fee;
    if (total !== input.expectedTotal) {
      database.exec("ROLLBACK");
      return { ok: false, code: "mismatch", merchandise, shipping, total };
    }

    for (const line of input.lines) {
      const result = line.variantId
        ? database
            .prepare("UPDATE variants SET stock = stock - ? WHERE id = ? AND stock >= ?")
            .run(line.qty, line.variantId, line.qty)
        : database
            .prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND has_variants = 0 AND stock >= ?")
            .run(line.qty, line.productId, line.qty);
      if (result.changes !== 1) {
        database.exec("ROLLBACK");
        return {
          ok: false,
          code: "stock",
          items: [{ name: line.name, optionLabel: line.optionLabel, stock: 0 }],
        };
      }
    }

    const createdAt = nowIso();
    const orderNo = uniqueOrderNo(database);
    const info = database
      .prepare(
        `INSERT INTO orders (
          order_no, user_id, buyer_name, buyer_phone, buyer_email, status, payment_method, payment_status,
          merchandise_total, shipping_fee, shipping_base, shipping_remote, total,
          recipient, recipient_phone, postal_code, address1, address2, memo, tracking_no, created_at
        ) VALUES (?, ?, ?, ?, ?, 'paid', ?, 'approved', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?)`,
      )
      .run(
        orderNo,
        input.userId ?? null,
        input.buyerName || "",
        input.buyerPhone,
        input.buyerEmail || "",
        input.paymentMethod,
        merchandise,
        shipping.fee,
        shipping.base,
        shipping.remote,
        total,
        input.recipient,
        input.recipientPhone,
        input.postalCode,
        input.address1,
        input.address2,
        input.memo || "",
        createdAt,
      );
    const orderId = Number(info.lastInsertRowid);
    const insertItem = database.prepare(
      `INSERT INTO order_items (order_id, product_id, variant_id, brand, name, option_label, unit_price, qty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const line of input.lines) {
      insertItem.run(
        orderId,
        line.productId,
        line.variantId,
        line.brand,
        line.name,
        line.optionLabel || "",
        line.unitPrice,
        line.qty,
      );
    }
    database
      .prepare(
        `INSERT INTO order_events (order_id, kind, from_status, to_status, note, created_at)
         VALUES (?, 'created', NULL, 'paid', '', ?)`,
      )
      .run(orderId, createdAt);
    database
      .prepare("INSERT INTO checkout_keys (key, order_id, created_at) VALUES (?, ?, ?)")
      .run(input.idemKey, orderId, createdAt);
    if (input.clearCartId) {
      database.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(input.clearCartId);
    }
    database.exec("COMMIT");
    return { ok: true, orderId, orderNo, total };
  } catch (error) {
    try {
      database.exec("ROLLBACK");
    } catch {
      /* already closed */
    }
    throw error;
  }
}

function restoreStock(database, item) {
  if (item.variant_id) {
    const variant = database.prepare("SELECT id FROM variants WHERE id = ?").get(item.variant_id);
    if (!variant) return false;
    const result = database
      .prepare("UPDATE variants SET stock = stock + ? WHERE id = ?")
      .run(item.qty, item.variant_id);
    return result.changes === 1;
  }
  const product = database.prepare("SELECT id, has_variants FROM products WHERE id = ?").get(item.product_id);
  if (!product || product.has_variants) return false;
  const result = database
    .prepare("UPDATE products SET stock = stock + ? WHERE id = ? AND has_variants = 0")
    .run(item.qty, item.product_id);
  return result.changes === 1;
}

function markCancelError(orderId, note) {
  const database = getDb();
  const now = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const order = database.prepare("SELECT status, payment_status FROM orders WHERE id = ?").get(orderId);
    if (!order || !CANCELABLE.has(order.status)) {
      database.exec("ROLLBACK");
      return;
    }
    database.prepare("UPDATE orders SET status = 'cancel_error' WHERE id = ?").run(orderId);
    database
      .prepare(
        `INSERT INTO order_events (order_id, kind, from_status, to_status, note, created_at)
         VALUES (?, 'cancel_error', ?, 'cancel_error', ?, ?)`,
      )
      .run(orderId, order.status, note, now);
    database.exec("COMMIT");
  } catch (error) {
    try {
      database.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw error;
  }
}

export function cancelOrder(orderId) {
  const database = getDb();
  database.exec("BEGIN IMMEDIATE");
  try {
    const order = database.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (!order) {
      database.exec("ROLLBACK");
      return { ok: false, code: "missing" };
    }
    if (!CANCELABLE.has(order.status)) {
      database.exec("ROLLBACK");
      return { ok: false, code: "locked", status: order.status };
    }
    const items = database.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
    for (const item of items) {
      if (!restoreStock(database, item)) {
        database.exec("ROLLBACK");
        markCancelError(orderId, "재고를 되돌리지 못해 결제 취소도 확정하지 않았습니다.");
        return { ok: false, code: "cancel_error" };
      }
    }
    const now = nowIso();
    const updated = database
      .prepare(
        `UPDATE orders
         SET status = 'cancelled', payment_status = 'cancelled', cancelled_at = ?
         WHERE id = ? AND status = ?`,
      )
      .run(now, orderId, order.status);
    if (updated.changes !== 1) {
      database.exec("ROLLBACK");
      markCancelError(orderId, "결제 취소와 재고 복구를 함께 마치지 못했습니다.");
      return { ok: false, code: "cancel_error" };
    }
    database
      .prepare(
        `INSERT INTO order_events (order_id, kind, from_status, to_status, note, created_at)
         VALUES (?, 'cancelled', ?, 'cancelled', '', ?)`,
      )
      .run(orderId, order.status, now);
    database.exec("COMMIT");
    return { ok: true };
  } catch (error) {
    try {
      database.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw error;
  }
}

export function transitionOrder(orderId, toStatus) {
  if (!["preparing", "shipping", "delivered"].includes(toStatus)) {
    return { ok: false, error: "바꿀 수 없는 상태입니다." };
  }
  const database = getDb();
  const order = database.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return { ok: false, error: "주문을 찾을 수 없습니다." };
  if (!(NEXT_STATUS[order.status] || []).includes(toStatus)) {
    return { ok: false, error: "이 주문은 그 상태로 옮길 수 없습니다." };
  }
  const now = nowIso();
  database.prepare("UPDATE orders SET status = ? WHERE id = ?").run(toStatus, orderId);
  database
    .prepare(
      `INSERT INTO order_events (order_id, kind, from_status, to_status, note, created_at)
       VALUES (?, 'status', ?, ?, '', ?)`,
    )
    .run(orderId, order.status, toStatus, now);
  return { ok: true };
}

export function saveTracking(orderId, trackingNo) {
  const value = String(trackingNo ?? "").trim().slice(0, 40);
  getDb().prepare("UPDATE orders SET tracking_no = ? WHERE id = ?").run(value, orderId);
}

export function getOrderByNo(orderNo) {
  return getDb().prepare("SELECT * FROM orders WHERE order_no = ?").get(String(orderNo ?? "").trim());
}

export function getOrderById(id) {
  return getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id);
}

export function orderItems(orderId) {
  return getDb().prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id").all(orderId);
}

export function orderEvents(orderId) {
  return getDb().prepare("SELECT * FROM order_events WHERE order_id = ? ORDER BY id").all(orderId);
}

export function canViewOrder(order, req) {
  if (!order) return false;
  if (req.user && order.user_id === req.user.id) return true;
  if (req.user?.role === "admin") return true;
  const allowed = req.session?.data?.guestOrderNos || [];
  return allowed.includes(order.order_no);
}

export function rememberGuestOrder(req, orderNo) {
  const list = new Set(req.session.data.guestOrderNos || []);
  list.add(orderNo);
  req.session.data.guestOrderNos = [...list];
}
