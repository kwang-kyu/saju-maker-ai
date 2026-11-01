import { getDb } from "./db.js";
import { getProduct, getVariants } from "./catalog.js";
import { MAX_LINE_QTY, nowIso } from "./util.js";

export function lineKey(productId, variantId) {
  return `${productId}:${variantId || "s"}`;
}

export function getCartRecord({ userId = null, sessionId = null, create = false }) {
  const database = getDb();
  let cart = userId
    ? database.prepare("SELECT * FROM carts WHERE user_id = ?").get(userId)
    : database.prepare("SELECT * FROM carts WHERE session_id = ?").get(sessionId);
  if (!cart && create) {
    const info = userId
      ? database.prepare("INSERT INTO carts (user_id, updated_at) VALUES (?, ?)").run(userId, nowIso())
      : database.prepare("INSERT INTO carts (session_id, updated_at) VALUES (?, ?)").run(sessionId, nowIso());
    cart = database.prepare("SELECT * FROM carts WHERE id = ?").get(Number(info.lastInsertRowid));
  }
  return cart || null;
}

export function cartQuantity({ userId = null, sessionId = null }) {
  const cart = getCartRecord({ userId, sessionId, create: false });
  if (!cart) return 0;
  return getDb().prepare("SELECT COALESCE(SUM(qty), 0) AS n FROM cart_items WHERE cart_id = ?").get(cart.id).n;
}

export function resolveCartItem(item) {
  const product = item.product_id ? getProduct(item.product_id) : null;
  const base = {
    id: item.id ?? null,
    productId: item.product_id,
    variantId: item.variant_id || null,
    qty: item.qty,
    seenPrice: item.seen_price,
    brand: product?.brand || "",
    name: product?.name || "상품",
    categoryName: product?.category_name || "",
    optionLabel: "",
    unitPrice: item.seen_price,
    stock: 0,
    lineTotal: 0,
    problems: [],
  };
  if (!product || product.status !== "selling") {
    base.problems = ["unavailable"];
    return base;
  }
  if (product.has_variants) {
    const variant = item.variant_id
      ? getVariants(product.id).find((row) => row.id === item.variant_id)
      : null;
    if (!variant) {
      base.problems = ["unavailable"];
      return base;
    }
    base.optionLabel = variant.option_label;
    base.unitPrice = variant.price;
    base.stock = variant.stock;
    base.variantId = variant.id;
  } else if (item.variant_id) {
    base.problems = ["unavailable"];
    return base;
  } else {
    base.unitPrice = product.price;
    base.stock = product.stock;
    base.variantId = null;
  }
  base.lineTotal = base.unitPrice * base.qty;
  if (base.stock <= 0) base.problems.push("soldout");
  else if (base.qty > base.stock) base.problems.push("stock");
  if (base.qty > MAX_LINE_QTY) base.problems.push("limit");
  if (base.unitPrice !== base.seenPrice) base.problems.push("price");
  return base;
}

export function listResolvedCart(cartId) {
  if (!cartId) return [];
  const items = getDb().prepare("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY id").all(cartId);
  return items.map(resolveCartItem);
}

function sellableChoice(productId, variantId) {
  const product = getProduct(productId);
  if (!product || product.status !== "selling") {
    return { error: "구매할 수 없는 상품입니다." };
  }
  if (product.has_variants) {
    if (!variantId) return { error: "옵션을 선택해 주세요." };
    const variant = getVariants(product.id).find((row) => row.id === Number(variantId));
    if (!variant) return { error: "옵션을 선택해 주세요." };
    if (variant.stock < 1) return { error: "품절인 옵션은 담을 수 없습니다." };
    return {
      product,
      variantId: variant.id,
      price: variant.price,
      stock: variant.stock,
      optionLabel: variant.option_label,
    };
  }
  if (product.stock < 1) return { error: "품절된 상품입니다." };
  return { product, variantId: null, price: product.price, stock: product.stock, optionLabel: "" };
}

export function addItem(cartId, { productId, variantId = null, qty, seenPrice = null, mode = "add" }) {
  const choice = sellableChoice(productId, variantId);
  if (choice.error && mode !== "merge") return { ok: false, error: choice.error };
  if (!Number.isInteger(qty) || qty < 1) {
    return { ok: false, error: "수량은 1 이상의 정수로 입력해 주세요." };
  }
  if (choice.error) {
    return { ok: true, note: `${getProduct(productId)?.name || "상품"}은 지금은 담을 수 없어 빼 두었습니다.` };
  }
  if (mode !== "merge" && qty > MAX_LINE_QTY) {
    return { ok: false, error: `한 번에 ${MAX_LINE_QTY}개까지 담을 수 있습니다.` };
  }

  const database = getDb();
  const key = lineKey(choice.product.id, choice.variantId);
  const existing = database
    .prepare("SELECT * FROM cart_items WHERE cart_id = ? AND line_key = ?")
    .get(cartId, key);
  let nextQty = (existing?.qty || 0) + qty;
  let note = null;
  if (nextQty > MAX_LINE_QTY) {
    if (mode !== "merge") return { ok: false, error: `한 번에 ${MAX_LINE_QTY}개까지 담을 수 있습니다.` };
    nextQty = MAX_LINE_QTY;
    note = `${choice.product.name} 수량을 ${MAX_LINE_QTY}개로 맞췄습니다.`;
  }
  if (nextQty > choice.stock) {
    if (mode !== "merge") return { ok: false, error: `재고가 ${choice.stock}개입니다.` };
    if (choice.stock < 1) {
      return { ok: true, note: `${choice.product.name}은 품절이라 담지 않았습니다.` };
    }
    nextQty = choice.stock;
    note = `${choice.product.name} 수량을 재고 ${choice.stock}개에 맞췄습니다.`;
  }
  if (existing) {
    database.prepare("UPDATE cart_items SET qty = ? WHERE id = ?").run(nextQty, existing.id);
  } else {
    database
      .prepare(
        `INSERT INTO cart_items (cart_id, product_id, variant_id, line_key, qty, seen_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        cartId,
        choice.product.id,
        choice.variantId,
        key,
        nextQty,
        seenPrice ?? choice.price,
      );
  }
  database.prepare("UPDATE carts SET updated_at = ? WHERE id = ?").run(nowIso(), cartId);
  return { ok: true, note };
}

export function updateItemQty(cartId, itemId, qty) {
  const database = getDb();
  const item = database.prepare("SELECT * FROM cart_items WHERE id = ? AND cart_id = ?").get(itemId, cartId);
  if (!item) return { ok: false, error: "장바구니에 없는 상품입니다." };
  if (!Number.isInteger(qty) || qty < 1) return { ok: false, error: "수량은 1 이상의 정수로 입력해 주세요." };
  if (qty > MAX_LINE_QTY) return { ok: false, error: `한 번에 ${MAX_LINE_QTY}개까지 주문할 수 있습니다.` };
  const resolved = resolveCartItem({ ...item, qty });
  if (resolved.problems.includes("unavailable")) {
    return { ok: false, error: "구매할 수 없는 상품입니다. 장바구니에서 빼 주세요." };
  }
  if (resolved.problems.includes("soldout") || qty > resolved.stock) {
    return { ok: false, error: resolved.stock > 0 ? `재고가 ${resolved.stock}개입니다.` : "품절된 상품은 수량을 바꿀 수 없습니다. 빼 주세요." };
  }
  database.prepare("UPDATE cart_items SET qty = ? WHERE id = ?").run(qty, item.id);
  return { ok: true };
}

export function removeItem(cartId, itemId) {
  getDb().prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?").run(itemId, cartId);
}

export function acceptItemPrice(cartId, itemId) {
  const database = getDb();
  const item = database.prepare("SELECT * FROM cart_items WHERE id = ? AND cart_id = ?").get(itemId, cartId);
  if (!item) return { ok: false, error: "장바구니에 없는 상품입니다." };
  const resolved = resolveCartItem(item);
  if (resolved.problems.includes("unavailable") || resolved.problems.includes("soldout")) {
    return { ok: false, error: "지금 가격을 확정할 수 없는 상품입니다." };
  }
  database.prepare("UPDATE cart_items SET seen_price = ? WHERE id = ?").run(resolved.unitPrice, item.id);
  return { ok: true, price: resolved.unitPrice };
}

export function mergeGuestCart(sessionId, userId) {
  const database = getDb();
  const guest = database.prepare("SELECT * FROM carts WHERE session_id = ?").get(sessionId);
  if (!guest) return [];
  const userCart = getCartRecord({ userId, create: true });
  const items = database.prepare("SELECT * FROM cart_items WHERE cart_id = ?").all(guest.id);
  const notes = [];
  for (const item of items) {
    const result = addItem(userCart.id, {
      productId: item.product_id,
      variantId: item.variant_id,
      qty: item.qty,
      seenPrice: item.seen_price,
      mode: "merge",
    });
    if (result.note) notes.push(result.note);
  }
  database.prepare("DELETE FROM carts WHERE id = ?").run(guest.id);
  return notes;
}

export function inspectPurchase({ productId, variantId = null, qty }) {
  const choice = sellableChoice(productId, variantId);
  if (choice.error) return { ok: false, error: choice.error };
  if (!Number.isInteger(qty) || qty < 1) return { ok: false, error: "수량은 1 이상의 정수로 입력해 주세요." };
  if (qty > MAX_LINE_QTY) return { ok: false, error: `한 번에 ${MAX_LINE_QTY}개까지 주문할 수 있습니다.` };
  if (qty > choice.stock) return { ok: false, error: `재고가 ${choice.stock}개입니다.` };
  return {
    ok: true,
    line: {
      product_id: choice.product.id,
      variant_id: choice.variantId,
      qty,
      seen_price: choice.price,
    },
  };
}
