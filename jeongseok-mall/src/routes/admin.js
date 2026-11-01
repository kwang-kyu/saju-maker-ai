import { getDb, getSettings, saveSettings } from "../db.js";
import { verifyPassword } from "../auth.js";
import { rotateSession } from "../session.js";
import { cancelOrder, getOrderById, orderEvents, orderItems, saveTracking, transitionOrder } from "../orders.js";
import { adminSubnav, csrfInput, fieldError, layout, orderStatus, setFlash, when } from "../html.js";
import {
  clip,
  esc,
  formatPhone,
  likeContains,
  normalizeEmail,
  optionLabel,
  parseMoney,
  parseQty,
  textToHtml,
  won,
} from "../util.js";

const PRODUCT_STATUS = {
  selling: "판매 중",
  hidden: "숨김",
  stopped: "판매 중지",
};

function send(res, body, status = 200) {
  res.status(status).type("html").send(body);
}

function go(res, location) {
  res.redirect(303, location);
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    go(res, "/admin/login");
    return;
  }
  if (req.user.role !== "admin") {
    send(res, layout(req, { title: "관리", main: `<h1>관리자만 볼 수 있습니다</h1>` }), 403);
    return;
  }
  next();
}

function shell(req, current, main) {
  return layout(req, { title: "관리", main, subnav: adminSubnav(current) });
}

export function registerAdmin(app) {
  app.get("/admin/login", (req, res) => {
    if (req.user?.role === "admin") return go(res, "/admin/products");
    send(res, layout(req, { title: "관리자 로그인", main: adminLogin(req, "") }));
  });

  app.post("/admin/login", (req, res) => {
    const email = normalizeEmail(req.body.email);
    const user = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || user.role !== "admin" || !verifyPassword(String(req.body.password ?? ""), user.password_hash)) {
      send(res, layout(req, { title: "관리자 로그인", main: adminLogin(req, "이메일 또는 비밀번호가 올바르지 않습니다.") }), 422);
      return;
    }
    rotateSession(req, res, user);
    go(res, "/admin/products");
  });

  app.get("/admin", requireAdmin, (req, res) => go(res, "/admin/products"));

  app.get("/admin/products", requireAdmin, (req, res) => {
    const products = getDb()
      .prepare(
        `SELECT p.*, c.name AS category_name,
          CASE WHEN p.has_variants = 1 THEN (SELECT MIN(price) FROM variants v WHERE v.product_id = p.id) ELSE p.price END AS rep_price,
          CASE WHEN p.has_variants = 1 THEN (SELECT COALESCE(SUM(stock), 0) FROM variants v WHERE v.product_id = p.id) ELSE p.stock END AS total_stock
         FROM products p JOIN categories c ON c.id = p.category_id
         ORDER BY p.id DESC`,
      )
      .all();
    const rows = products
      .map(
        (product) => `<tr>
          <td><a href="/admin/products/${product.id}">${esc(product.name)}</a><br><span class="muted">${esc(product.brand)}</span></td>
          <td>${esc(product.category_name)}</td>
          <td>${esc(PRODUCT_STATUS[product.status])}</td>
          <td>${won(product.rep_price)}${product.has_variants ? "부터" : ""}</td>
          <td>${product.total_stock}</td>
        </tr>`,
      )
      .join("");
    send(
      res,
      shell(
        req,
        "/admin/products",
        `<div class="section-head"><h1>상품</h1><a class="btn" href="/admin/products/new">상품 등록</a></div>
        <div class="table-wrap"><table>
          <thead><tr><th>상품</th><th>분류</th><th>상태</th><th>가격</th><th>재고</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`,
      ),
    );
  });

  app.get("/admin/products/new", requireAdmin, (req, res) => {
    send(res, shell(req, "/admin/products", productForm(req, emptyProduct(), {})));
  });

  app.post("/admin/products", requireAdmin, (req, res) => saveProductRoute(req, res, null));

  app.get("/admin/products/:id", requireAdmin, (req, res) => {
    const product = loadProduct(req.params.id);
    if (!product) {
      send(res, shell(req, "/admin/products", `<h1>상품을 찾을 수 없습니다</h1>`), 404);
      return;
    }
    send(res, shell(req, "/admin/products", productForm(req, product, {})));
  });

  app.post("/admin/products/:id", requireAdmin, (req, res) => saveProductRoute(req, res, Number(req.params.id)));

  app.get("/admin/categories", requireAdmin, (req, res) => {
    send(res, shell(req, "/admin/categories", categoryPage(req, "")));
  });

  app.post("/admin/categories", requireAdmin, (req, res) => {
    const name = clip(req.body.name, 40);
    if (!name) {
      send(res, shell(req, "/admin/categories", categoryPage(req, "분류 이름을 40자 안으로 입력해 주세요.")), 422);
      return;
    }
    const database = getDb();
    if (database.prepare("SELECT id FROM categories WHERE name = ?").get(name)) {
      send(res, shell(req, "/admin/categories", categoryPage(req, "같은 이름의 분류가 있습니다.")), 422);
      return;
    }
    const sort = database.prepare("SELECT COALESCE(MAX(sort_order), 0) AS n FROM categories").get().n + 1;
    const info = database.prepare("INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)").run(name, `tmp-${Date.now()}`, sort);
    const id = Number(info.lastInsertRowid);
    database.prepare("UPDATE categories SET slug = ? WHERE id = ?").run(`cat-${id}`, id);
    setFlash(req, "info", "분류를 추가했습니다.");
    go(res, "/admin/categories");
  });

  app.post("/admin/categories/:id", requireAdmin, (req, res) => {
    const category = categoryById(req.params.id);
    if (!category) return go(res, "/admin/categories");
    const name = clip(req.body.name, 40);
    if (!name) {
      setFlash(req, "error", "분류 이름을 입력해 주세요.");
      go(res, "/admin/categories");
      return;
    }
    const taken = getDb().prepare("SELECT id FROM categories WHERE name = ? AND id != ?").get(name, category.id);
    if (taken) {
      setFlash(req, "error", "같은 이름의 분류가 있습니다.");
      go(res, "/admin/categories");
      return;
    }
    getDb().prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, category.id);
    setFlash(req, "info", "분류 이름을 바꿨습니다.");
    go(res, "/admin/categories");
  });

  app.post("/admin/categories/:id/delete", requireAdmin, (req, res) => {
    const category = categoryById(req.params.id);
    if (!category) return go(res, "/admin/categories");
    const count = getDb().prepare("SELECT COUNT(*) AS n FROM products WHERE category_id = ?").get(category.id).n;
    if (count) {
      setFlash(req, "error", "상품이 있는 분류는 지울 수 없습니다. 이름만 바꿀 수 있습니다.");
      go(res, "/admin/categories");
      return;
    }
    getDb().prepare("DELETE FROM categories WHERE id = ?").run(category.id);
    go(res, "/admin/categories");
  });

  app.get("/admin/orders", requireAdmin, (req, res) => {
    const status = ["paid", "preparing", "shipping", "delivered", "cancelled", "cancel_error"].includes(req.query.status)
      ? req.query.status
      : "";
    const orderNo = String(req.query.order_no ?? "").trim().slice(0, 40);
    const recipient = String(req.query.recipient ?? "").trim().slice(0, 40);
    const where = [];
    const params = [];
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    if (orderNo) {
      where.push("order_no LIKE ? ESCAPE '\\'");
      params.push(likeContains(orderNo));
    }
    if (recipient) {
      where.push("recipient LIKE ? ESCAPE '\\'");
      params.push(likeContains(recipient));
    }
    const sql = `SELECT * FROM orders ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id DESC LIMIT 100`;
    const orders = getDb().prepare(sql).all(...params);
    const options = ["", "paid", "preparing", "shipping", "delivered", "cancelled", "cancel_error"]
      .map((value) => {
        const label = value ? orderStatus(value) : "전체 상태";
        const selected = value === status ? " selected" : "";
        return `<option value="${value}"${selected}>${label}</option>`;
      })
      .join("");
    const rows = orders
      .map(
        (order) => `<tr>
          <td><a href="/admin/orders/${order.id}">${esc(order.order_no)}</a></td>
          <td>${esc(orderStatus(order.status))}</td>
          <td>${esc(order.recipient)}</td>
          <td>${won(order.total)}</td>
          <td>${esc(when(order.created_at))}</td>
        </tr>`,
      )
      .join("");
    send(
      res,
      shell(
        req,
        "/admin/orders",
        `<h1>주문</h1>
        <form class="filters" method="get" action="/admin/orders">
          <label>상태 <select name="status">${options}</select></label>
          <label>주문 번호 <input name="order_no" value="${esc(orderNo)}"></label>
          <label>수령인 <input name="recipient" value="${esc(recipient)}"></label>
          <button class="btn secondary" type="submit">찾기</button>
        </form>
        <div class="table-wrap"><table>
          <thead><tr><th>주문 번호</th><th>상태</th><th>수령인</th><th>금액</th><th>시각</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="5">주문이 없습니다.</td></tr>`}</tbody>
        </table></div>`,
      ),
    );
  });

  app.get("/admin/orders/:id", requireAdmin, (req, res) => {
    const order = loadOrder(req.params.id);
    if (!order) {
      send(res, shell(req, "/admin/orders", `<h1>주문을 찾을 수 없습니다</h1>`), 404);
      return;
    }
    send(res, shell(req, "/admin/orders", orderAdmin(req, order)));
  });

  app.post("/admin/orders/:id", requireAdmin, (req, res) => {
    const order = loadOrder(req.params.id);
    if (!order) return go(res, "/admin/orders");
    const action = String(req.body.action || "");
    if (action === "tracking") {
      saveTracking(order.id, req.body.tracking_no);
      setFlash(req, "info", "송장 번호를 저장했습니다.");
      go(res, `/admin/orders/${order.id}`);
      return;
    }
    if (action === "cancel") {
      const result = cancelOrder(order.id);
      setFlash(req, result.ok ? "info" : "error", result.ok ? "주문을 취소했습니다." : "취소를 끝내지 못했습니다. 주문 상태를 확인해 주세요.");
      go(res, `/admin/orders/${order.id}`);
      return;
    }
    if (["preparing", "shipping", "delivered"].includes(action)) {
      if (action === "shipping" || req.body.tracking_no) saveTracking(order.id, req.body.tracking_no);
      const result = transitionOrder(order.id, action);
      setFlash(req, result.ok ? "info" : "error", result.ok ? "상태를 바꿨습니다." : result.error);
      go(res, `/admin/orders/${order.id}`);
      return;
    }
    setFlash(req, "error", "처리할 수 없는 동작입니다.");
    go(res, `/admin/orders/${order.id}`);
  });

  app.get("/admin/settings", requireAdmin, (req, res) => {
    send(res, shell(req, "/admin/settings", settingsForm(req, getSettings(), {})));
  });

  app.post("/admin/settings", requireAdmin, (req, res) => {
    const errors = {};
    const threshold = parseMoney(req.body.free_shipping_threshold);
    const base = parseMoney(req.body.base_shipping_fee);
    const remote = parseMoney(req.body.remote_surcharge);
    const notice = clip(req.body.customer_center_notice, 1000);
    const prefixes = String(req.body.remote_prefixes ?? "")
      .split(/[\s,]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (threshold === null) errors.free_shipping_threshold = "무료배송 기준은 0 이상의 정수입니다.";
    if (base === null) errors.base_shipping_fee = "기본 배송비는 0 이상의 정수입니다.";
    if (remote === null) errors.remote_surcharge = "도서산간 추가액은 0 이상의 정수입니다.";
    if (notice === null || !notice) errors.customer_center_notice = "고객센터 안내를 입력해 주세요.";
    if (prefixes.some((prefix) => !/^\d{2,5}$/.test(prefix))) {
      errors.remote_prefixes = "우편번호 앞자리는 숫자 2자리에서 5자리로 적어 주세요.";
    }
    const settings = {
      freeShippingThreshold: threshold ?? 0,
      baseShippingFee: base ?? 0,
      remoteSurcharge: remote ?? 0,
      remotePrefixes: prefixes,
      customerCenterNotice: notice || "",
    };
    if (Object.keys(errors).length) {
      send(res, shell(req, "/admin/settings", settingsForm(req, settings, errors)), 422);
      return;
    }
    saveSettings(getDb(), settings);
    setFlash(req, "info", "배송 설정을 저장했습니다.");
    go(res, "/admin/settings");
  });
}

function adminLogin(req, message) {
  return `<section class="auth"><h1>관리자 로그인</h1>
    ${message ? `<p class="field-error" role="alert">${esc(message)}</p>` : ""}
    <form method="post" action="/admin/login" class="stack">
      ${csrfInput(req)}
      <label for="email">이메일</label>
      <input id="email" name="email" type="email" autocomplete="username" required>
      <label for="password">비밀번호</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
      <button class="btn" type="submit">들어가기</button>
    </form>
    <p class="muted">고객 가입으로는 관리자가 되지 않습니다.</p>
  </section>`;
}

function emptyProduct() {
  return {
    id: null,
    brand: "",
    name: "",
    description: "",
    status: "selling",
    category_id: "",
    has_variants: 0,
    price: "",
    stock: "",
    variants: [],
  };
}

function loadProduct(id) {
  if (!/^\d+$/.test(String(id))) return null;
  const product = getDb().prepare("SELECT * FROM products WHERE id = ?").get(Number(id));
  if (!product) return null;
  product.variants = getDb().prepare("SELECT * FROM variants WHERE product_id = ? ORDER BY id").all(product.id);
  return product;
}

function productForm(req, product, errors) {
  const categories = getDb().prepare("SELECT id, name FROM categories ORDER BY sort_order, id").all();
  const categoryOptions = categories
    .map((category) => {
      const selected = Number(product.category_id) === category.id ? " selected" : "";
      return `<option value="${category.id}"${selected}>${esc(category.name)}</option>`;
    })
    .join("");
  const statusOptions = Object.entries(PRODUCT_STATUS)
    .map(([value, label]) => `<option value="${value}"${product.status === value ? " selected" : ""}>${label}</option>`)
    .join("");
  const action = product.id ? `/admin/products/${product.id}` : "/admin/products";
  return `<h1>${product.id ? "상품 수정" : "상품 등록"}</h1>
    <form method="post" action="${action}" class="stack product-form">
      ${csrfInput(req)}
      <label for="brand">브랜드</label>
      <input id="brand" name="brand" value="${esc(product.brand)}" maxlength="40" required>
      ${fieldError(errors, "brand")}
      <label for="name">상품명</label>
      <input id="name" name="name" value="${esc(product.name)}" maxlength="80" required>
      ${fieldError(errors, "name")}
      <label for="category_id">분류</label>
      <select id="category_id" name="category_id">${categoryOptions}</select>
      ${fieldError(errors, "category_id")}
      <label for="status">판매 상태</label>
      <select id="status" name="status">${statusOptions}</select>
      <label for="description">설명</label>
      <textarea id="description" name="description" rows="5" required>${esc(product.description)}</textarea>
      ${fieldError(errors, "description")}
      <label class="choice"><input type="checkbox" name="has_variants" value="1"${product.has_variants ? " checked" : ""}> 옵션 상품 (색, 사이즈)</label>
      <fieldset>
        <legend>단품 가격과 재고</legend>
        <p class="muted">옵션 상품이 아니면 여기만 씁니다.</p>
        <label for="price">가격</label>
        <input id="price" name="price" inputmode="numeric" value="${esc(product.price ?? "")}">
        ${fieldError(errors, "price")}
        <label for="stock">재고</label>
        <input id="stock" name="stock" inputmode="numeric" value="${esc(product.stock ?? "")}">
        ${fieldError(errors, "stock")}
      </fieldset>
      <fieldset>
        <legend>옵션</legend>
        <p class="muted">옵션 상품이면 각 줄에 색 또는 사이즈, 가격, 재고를 적습니다. 빈 줄은 무시합니다.</p>
        <div data-variant-rows>${variantEditor(product.variants || [])}</div>
        <button class="btn secondary" type="button" data-add-variant>옵션 줄 추가</button>
        ${fieldError(errors, "variants")}
      </fieldset>
      <button class="btn" type="submit">저장</button>
    </form>`;
}

function variantEditor(variants) {
  const source = [...variants];
  source.push({}, {});
  return source.map((variant, index) => variantRow(index, variant)).join("");
}

function variantRow(index, variant) {
  return `<div class="variant-row">
    <input type="hidden" name="variant_id_${index}" value="${esc(variant.id || "")}">
    <label>색 <input name="color_${index}" value="${esc(variant.color || "")}" maxlength="30"></label>
    <label>사이즈 <input name="size_${index}" value="${esc(variant.size || "")}" maxlength="30"></label>
    <label>가격 <input name="price_${index}" inputmode="numeric" value="${esc(variant.price ?? "")}"></label>
    <label>재고 <input name="stock_${index}" inputmode="numeric" value="${esc(variant.stock ?? "")}"></label>
  </div>`;
}

function saveProductRoute(req, res, id) {
  const parsed = readProductForm(req.body);
  if (id && !loadProduct(id)) {
    send(res, shell(req, "/admin/products", `<h1>상품을 찾을 수 없습니다</h1>`), 404);
    return;
  }
  if (Object.keys(parsed.errors).length) {
    send(res, shell(req, "/admin/products", productForm(req, { id, ...parsed.form }, parsed.errors)), 422);
    return;
  }
  const savedId = writeProduct(id, parsed.form);
  setFlash(req, "info", "상품을 저장했습니다.");
  go(res, `/admin/products/${savedId}`);
}

function readProductForm(body) {
  const errors = {};
  const brand = clip(body.brand, 40);
  const name = clip(body.name, 80);
  const description = clip(body.description, 4000);
  const status = ["selling", "hidden", "stopped"].includes(body.status) ? body.status : "selling";
  const categoryId = /^\d+$/.test(String(body.category_id || "")) ? Number(body.category_id) : null;
  const hasVariants = body.has_variants === "1";
  if (brand === null || !brand) errors.brand = "브랜드를 40자 안으로 입력해 주세요.";
  if (name === null || !name) errors.name = "상품명을 80자 안으로 입력해 주세요.";
  if (description === null || !description) errors.description = "설명을 입력해 주세요.";
  if (!categoryId || !getDb().prepare("SELECT id FROM categories WHERE id = ?").get(categoryId)) {
    errors.category_id = "분류를 선택해 주세요.";
  }
  const form = {
    brand: body.brand || "",
    name: body.name || "",
    description: body.description || "",
    status,
    category_id: categoryId,
    has_variants: hasVariants ? 1 : 0,
    price: body.price ?? "",
    stock: body.stock ?? "",
    variants: [],
  };
  if (!hasVariants) {
    const price = parseMoney(body.price);
    const stock = parseQty(body.stock);
    if (price === null || price < 1) errors.price = "가격은 1원 이상의 정수로 입력해 주세요.";
    if (stock === null) errors.stock = "재고는 0 이상의 정수로 입력해 주세요.";
    form.price = price;
    form.stock = stock;
  } else {
    const seen = new Set();
    for (let index = 0; index < 30; index += 1) {
      const color = String(body[`color_${index}`] ?? "").trim();
      const size = String(body[`size_${index}`] ?? "").trim();
      const priceRaw = String(body[`price_${index}`] ?? "").trim();
      const stockRaw = String(body[`stock_${index}`] ?? "").trim();
      const idRaw = String(body[`variant_id_${index}`] ?? "").trim();
      if (!color && !size && !priceRaw && !stockRaw) continue;
      if (!errors.variants && (color.length > 30 || size.length > 30)) errors.variants = "옵션 이름은 30자 안으로 입력해 주세요.";
      if (!errors.variants && !color && !size) errors.variants = "색 또는 사이즈를 입력해 주세요.";
      const price = parseMoney(priceRaw);
      const stock = parseQty(stockRaw);
      if (!errors.variants && (price === null || price < 1)) errors.variants = "옵션 가격은 1원 이상의 정수입니다.";
      if (!errors.variants && stock === null) errors.variants = "옵션 재고는 0 이상의 정수입니다.";
      const label = optionLabel(color, size);
      if (!errors.variants && seen.has(label)) errors.variants = "같은 옵션 조합이 두 번 있습니다.";
      seen.add(label);
      form.variants.push({
        id: /^\d+$/.test(idRaw) ? Number(idRaw) : null,
        color,
        size,
        label,
        price,
        stock,
      });
    }
    if (!errors.variants && form.variants.length === 0) errors.variants = "옵션을 하나 이상 입력해 주세요.";
    form.price = null;
    form.stock = null;
  }
  if (!errors.brand) form.brand = brand;
  if (!errors.name) form.name = name;
  if (!errors.description) form.description = description;
  return { errors, form };
}

function writeProduct(id, form) {
  const database = getDb();
  database.exec("BEGIN");
  try {
    let productId = id;
    if (productId) {
      database
        .prepare(
          `UPDATE products
           SET category_id = ?, brand = ?, name = ?, description = ?, status = ?, has_variants = ?, price = ?, stock = ?
           WHERE id = ?`,
        )
        .run(
          form.category_id,
          form.brand,
          form.name,
          form.description,
          form.status,
          form.has_variants,
          form.has_variants ? null : form.price,
          form.has_variants ? null : form.stock,
          productId,
        );
    } else {
      const info = database
        .prepare(
          `INSERT INTO products (category_id, brand, name, description, status, has_variants, price, stock, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          form.category_id,
          form.brand,
          form.name,
          form.description,
          form.status,
          form.has_variants,
          form.has_variants ? null : form.price,
          form.has_variants ? null : form.stock,
          new Date().toISOString(),
        );
      productId = Number(info.lastInsertRowid);
    }
    if (!form.has_variants) {
      database.prepare("DELETE FROM variants WHERE product_id = ?").run(productId);
    } else {
      const keep = [];
      for (const variant of form.variants) {
        if (variant.id) {
          const owned = database.prepare("SELECT id FROM variants WHERE id = ? AND product_id = ?").get(variant.id, productId);
          if (!owned) throw new Error("variant does not belong to this product");
          database
            .prepare("UPDATE variants SET color = ?, size = ?, option_label = ?, price = ?, stock = ? WHERE id = ?")
            .run(variant.color, variant.size, variant.label, variant.price, variant.stock, variant.id);
          keep.push(variant.id);
        } else {
          const info = database
            .prepare(
              `INSERT INTO variants (product_id, color, size, option_label, price, stock)
               VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .run(productId, variant.color, variant.size, variant.label, variant.price, variant.stock);
          keep.push(Number(info.lastInsertRowid));
        }
      }
      const existing = database.prepare("SELECT id FROM variants WHERE product_id = ?").all(productId);
      for (const variant of existing) {
        if (!keep.includes(variant.id)) database.prepare("DELETE FROM variants WHERE id = ?").run(variant.id);
      }
    }
    database.exec("COMMIT");
    return productId;
  } catch (error) {
    try {
      database.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw error;
  }
}

function categoryById(id) {
  if (!/^\d+$/.test(String(id))) return null;
  return getDb().prepare("SELECT * FROM categories WHERE id = ?").get(Number(id));
}

function categoryPage(req, error) {
  const categories = getDb()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
       FROM categories c ORDER BY sort_order, id`,
    )
    .all();
  const rows = categories
    .map(
      (category) => `<li>
        <form method="post" action="/admin/categories/${category.id}" class="inline">
          ${csrfInput(req)}
          <label class="sr" for="name-${category.id}">분류 이름</label>
          <input id="name-${category.id}" name="name" value="${esc(category.name)}" maxlength="40">
          <button class="btn secondary" type="submit">이름 저장</button>
        </form>
        <span class="muted">상품 ${category.product_count}</span>
        <form method="post" action="/admin/categories/${category.id}/delete">${csrfInput(req)}<button class="linkish" type="submit">삭제</button></form>
      </li>`,
    )
    .join("");
  return `<h1>분류</h1>
    <p class="muted">이름은 운영자가 바꿉니다. 주소는 그대로 둡니다.</p>
    ${error ? `<p class="field-error">${esc(error)}</p>` : ""}
    <ul class="category-admin">${rows}</ul>
    <h2>분류 추가</h2>
    <form method="post" action="/admin/categories" class="inline">
      ${csrfInput(req)}
      <label for="new-category">이름</label>
      <input id="new-category" name="name" maxlength="40" required>
      <button class="btn" type="submit">추가</button>
    </form>`;
}

function loadOrder(id) {
  if (!/^\d+$/.test(String(id))) return null;
  return getOrderById(Number(id));
}

function orderAdmin(req, order) {
  const items = orderItems(order.id)
    .map(
      (item) => `<li>${esc(item.brand)} ${esc(item.name)}${item.option_label ? ` · ${esc(item.option_label)}` : ""}
        · ${won(item.unit_price)} × ${item.qty}</li>`,
    )
    .join("");
  const events = orderEvents(order.id)
    .map((event) => `<li>${esc(when(event.created_at))} ${esc(event.kind)} ${esc(event.from_status || "")} → ${esc(event.to_status || "")} ${esc(event.note)}</li>`)
    .join("");
  const nextButtons = [
    ["preparing", "상품 준비 중"],
    ["shipping", "배송 중"],
    ["delivered", "배송 완료"],
  ]
    .filter(([status]) => ({ paid: ["preparing"], preparing: ["shipping"], shipping: ["delivered"] }[order.status] || []).includes(status))
    .map(([status, label]) => `<button class="btn" name="action" value="${status}" type="submit">${label}</button>`)
    .join("");
  const cancel = ["paid", "preparing"].includes(order.status)
    ? `<button class="btn secondary" name="action" value="cancel" type="submit">주문 취소</button>`
    : "";
  return `<p class="eyebrow">주문</p>
    <h1>${esc(order.order_no)}</h1>
    <p>${esc(orderStatus(order.status))} · 결제 ${order.payment_status === "approved" ? "승인" : esc(order.payment_status)} · ${won(order.total)}</p>
    <ul>${items}</ul>
    <p>상품 금액 ${won(order.merchandise_total)} · 배송비 ${won(order.shipping_fee)} (기본 ${won(order.shipping_base)}, 도서산간 ${won(order.shipping_remote)})</p>
    <h2>받는 사람</h2>
    <p>${esc(order.recipient)} · ${esc(formatPhone(order.recipient_phone))}</p>
    <p>${esc(order.postal_code)} ${esc(order.address1)} ${esc(order.address2)}</p>
    ${order.memo ? `<p>메모 ${esc(order.memo)}</p>` : ""}
    <p>주문자 연락처 ${esc(formatPhone(order.buyer_phone))}</p>
    <form method="post" action="/admin/orders/${order.id}" class="stack">
      ${csrfInput(req)}
      <label for="tracking_no">송장 번호</label>
      <input id="tracking_no" name="tracking_no" value="${esc(order.tracking_no)}" maxlength="40">
      <div class="row-actions">
        <button class="btn secondary" name="action" value="tracking" type="submit">송장만 저장</button>
        ${nextButtons}
        ${cancel}
      </div>
    </form>
    <h2>기록</h2>
    <ul>${events}</ul>
    <div class="note"><p>${textToHtml(getSettings().customerCenterNotice)}</p></div>`;
}
