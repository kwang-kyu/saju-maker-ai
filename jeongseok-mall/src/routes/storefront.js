import { getDb, getSettings } from "../db.js";
import { getProduct, getVariants, categoryBySlug, listProducts, productSvg } from "../catalog.js";
import {
  acceptItemPrice,
  addItem,
  getCartRecord,
  inspectPurchase,
  listResolvedCart,
  removeItem,
  resolveCartItem,
  updateItemQty,
} from "../cart.js";
import {
  assessCardPayment,
  canCustomerCancel,
  canViewOrder,
  cancelOrder,
  getOrderByNo,
  orderItems,
  placeOrder,
  rememberGuestOrder,
} from "../orders.js";
import { cartShippingNote, quoteShipping, shippingDetail } from "../shipping.js";
import { csrfInput, fieldError, layout, money, orderStatus, pager, problemText, productCards, setFlash, when } from "../html.js";
import {
  MAX_LINE_QTY,
  PAYMENT_LABEL,
  clip,
  esc,
  formatPhone,
  normalizePhone,
  parseQty,
  textToHtml,
  validPhone,
  validPostal,
  won,
} from "../util.js";
import { randomToken } from "../auth.js";

function send(res, body, status = 200) {
  res.status(status).type("html").send(body);
}

function go(res, location) {
  res.redirect(303, location);
}

function intParam(value) {
  if (!/^\d+$/.test(String(value ?? ""))) return null;
  return Number(value);
}

function sortKey(value) {
  return ["new", "price_asc", "price_desc"].includes(value) ? value : "new";
}

function pageNumber(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

function shippingBlurb(settings) {
  return `주문 금액이 ${won(settings.freeShippingThreshold)} 이상이면 기본 배송비는 없습니다. 그보다 적으면 기본 배송비 ${won(settings.baseShippingFee)}이 주문당 한 번 붙습니다. 도서산간 지역은 주소를 확인한 뒤 ${won(settings.remoteSurcharge)}이 더해집니다. 주소가 있어야 정해지는 금액은 주문서에서 다시 보여 드립니다.`;
}

function listHref(pathname, { sort, page, q }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (sort && sort !== "new") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function sortNav(pathname, sort, q) {
  const items = [
    ["new", "등록순"],
    ["price_asc", "낮은 가격"],
    ["price_desc", "높은 가격"],
  ];
  return `<nav class="sort" aria-label="정렬">${items
    .map(([key, label]) => {
      const current = key === sort ? ' aria-current="page"' : "";
      return `<a href="${listHref(pathname, { sort: key, page: 1, q })}"${current}>${label}</a>`;
    })
    .join("")}</nav>`;
}

export function registerStorefront(app) {
  app.get("/", (req, res) => {
    const categories = listProducts({ page: 1, pageSize: 8 });
    const cats = getDb().prepare("SELECT id, name, slug FROM categories ORDER BY sort_order, id").all();
    const catGrid = cats
      .map(
        (category) => `<a class="cat-tile" href="/c/${esc(category.slug)}"><span>${esc(category.name)}</span></a>`,
      )
      .join("");
    send(
      res,
      layout(req, {
        title: "",
        main: `<section class="hero">
          <p class="eyebrow">여러 상품을 한 주문으로</p>
          <h1>필요한 물건을 골라, 한 번에 받아 보세요.</h1>
          <p>분류를 둘러보거나 상품명으로 찾을 수 있습니다. 로그인하지 않아도 주문할 수 있습니다.</p>
        </section>
        <section>
          <h2>분류</h2>
          <div class="cat-grid">${catGrid}</div>
        </section>
        <section>
          <h2>새로 등록된 상품</h2>
          ${productCards(categories.items)}
        </section>`,
      }),
    );
  });

  app.get("/c/:slug", (req, res) => {
    const category = categoryBySlug(req.params.slug);
    if (!category) {
      send(res, layout(req, { title: "분류", main: `<h1>분류를 찾을 수 없습니다</h1><p><a href="/">홈으로</a></p>` }), 404);
      return;
    }
    const sort = sortKey(req.query.sort);
    const result = listProducts({ categoryId: category.id, sort, page: pageNumber(req.query.page) });
    const body = result.total
      ? `${sortNav(req.path, sort, "")}${productCards(result.items)}${pager({
          page: result.page,
          pageCount: result.pageCount,
          hrefFor: (page) => listHref(req.path, { sort, page, q: "" }),
        })}`
      : `<div class="empty"><p>이 분류에는 아직 판매 중인 상품이 없습니다.</p><a class="btn" href="/">다른 분류 보기</a></div>`;
    send(
      res,
      layout(req, {
        title: category.name,
        main: `<h1>${esc(category.name)}</h1>${body}`,
      }),
    );
  });

  app.get("/search", (req, res) => {
    const q = String(req.query.q ?? "").trim();
    if (!q) {
      send(
        res,
        layout(req, {
          title: "검색",
          main: `<h1>검색</h1><p>검색어를 입력해 주세요.</p>`,
        }),
      );
      return;
    }
    if (q.length > 80) {
      send(res, layout(req, { title: "검색", main: `<h1>검색</h1><p>검색어가 너무 깁니다.</p>` }), 400);
      return;
    }
    const sort = sortKey(req.query.sort);
    const result = listProducts({ query: q, sort, page: pageNumber(req.query.page) });
    const body = result.total
      ? `<p class="muted">${result.total}개 상품</p>${sortNav("/search", sort, q)}${productCards(result.items)}${pager({
          page: result.page,
          pageCount: result.pageCount,
          hrefFor: (page) => listHref("/search", { sort, page, q }),
        })}`
      : `<div class="empty"><p>‘${esc(q)}’에 맞는 판매 중 상품이 없습니다.</p></div>`;
    send(res, layout(req, { title: "검색", main: `<h1>검색</h1>${body}` }));
  });

  app.get("/media/products/:id.svg", (req, res) => {
    const id = intParam(String(req.params.id).replace(/\.svg$/, ""));
    const product = id ? getProduct(id) : null;
    if (!product) {
      res.status(404).type("text").send("not found");
      return;
    }
    res.type("image/svg+xml").send(productSvg(product));
  });

  app.get("/products/:id", (req, res) => {
    const product = getProduct(intParam(req.params.id));
    if (!product) {
      send(res, layout(req, { title: "상품", main: `<h1>상품을 찾을 수 없습니다</h1><p><a href="/">홈으로</a></p>` }), 404);
      return;
    }
    if (product.status !== "selling") {
      send(
        res,
        layout(req, {
          title: "상품",
          main: `<div class="empty"><h1>지금은 구매할 수 없는 상품입니다</h1><p>판매 중이 아니라 담거나 주문할 수 없습니다.</p><a class="btn" href="/">상품 보러 가기</a></div>`,
        }),
      );
      return;
    }
    const settings = getSettings();
    const variants = product.has_variants ? getVariants(product.id) : [];
    const varied = Number(product.price_count) > 1;
    const soldout = Number(product.total_stock) <= 0;
    const price = `<p class="pdp-price" data-price>${won(product.rep_price)}${varied ? "~" : ""}</p>${
      varied ? `<p class="muted">표시 가격은 옵션 중 가장 낮은 가격입니다. 옵션을 고르면 그 가격으로 바뀝니다.</p>` : ""
    }`;
    let purchase = "";
    if (soldout) {
      purchase = `<p class="badge static">품절</p><p>품절되어 장바구니에 담을 수 없습니다.</p>`;
    } else if (product.has_variants) {
      const options = variants
        .map((variant) => {
          const disabled = variant.stock <= 0 ? " disabled" : "";
          const stockText = variant.stock <= 0 ? " · 품절" : ` · 재고 ${variant.stock}`;
          return `<option value="${variant.id}" data-price="${variant.price}" data-stock="${variant.stock}"${disabled}>${esc(variant.option_label)} · ${won(variant.price)}${stockText}</option>`;
        })
        .join("");
      purchase = `<form method="post" action="/products/${product.id}/add" class="buy-box">
        ${csrfInput(req)}
        <label for="variant_id">옵션</label>
        <select id="variant_id" name="variant_id" data-variant-select required>
          <option value="">옵션을 선택해 주세요</option>
          ${options}
        </select>
        <p class="field-hint" data-stock></p>
        <label for="qty">수량</label>
        <input id="qty" name="qty" type="number" min="1" max="${MAX_LINE_QTY}" value="1" required>
        <div class="row-actions">
          <button class="btn" type="submit">장바구니 담기</button>
          <button class="btn secondary" type="submit" formaction="/products/${product.id}/buy">바로 구매</button>
        </div>
      </form>`;
    } else {
      purchase = `<form method="post" action="/products/${product.id}/add" class="buy-box">
        ${csrfInput(req)}
        <label for="qty">수량</label>
        <input id="qty" name="qty" type="number" min="1" max="${Math.min(product.stock, MAX_LINE_QTY)}" value="1" required>
        <p class="field-hint">재고 ${product.stock}개</p>
        <div class="row-actions">
          <button class="btn" type="submit">장바구니 담기</button>
          <button class="btn secondary" type="submit" formaction="/products/${product.id}/buy">바로 구매</button>
        </div>
      </form>`;
    }
    send(
      res,
      layout(req, {
        title: product.name,
        main: `<article class="pdp">
          <img src="/media/products/${product.id}.svg" alt="${esc(product.name)}">
          <div>
            <p class="brand">${esc(product.brand)}</p>
            <p class="muted">${esc(product.category_name)}</p>
            <h1>${esc(product.name)}</h1>
            ${price}
            ${purchase}
            <aside class="note">
              <h2>배송</h2>
              <p>${esc(shippingBlurb(settings))}</p>
            </aside>
            <div class="description"><h2>상품 설명</h2><p>${textToHtml(product.description)}</p></div>
          </div>
        </article>`,
      }),
    );
  });

  app.post("/products/:id/add", (req, res) => addOrBuy(req, res, "cart"));
  app.post("/products/:id/buy", (req, res) => addOrBuy(req, res, "buy"));

  app.get("/cart", (req, res) => {
    const cart = currentCart(req, false);
    const lines = cart ? listResolvedCart(cart.id) : [];
    send(res, layout(req, { title: "장바구니", main: cartBody(req, lines) }));
  });

  app.post("/cart/items/:id", (req, res) => {
    const cart = currentCart(req, false);
    if (!cart) {
      go(res, "/cart");
      return;
    }
    const qty = parseQty(req.body.qty);
    const result = updateItemQty(cart.id, intParam(req.params.id), qty);
    if (!result.ok) setFlash(req, "error", result.error);
    go(res, "/cart");
  });

  app.post("/cart/items/:id/delete", (req, res) => {
    const cart = currentCart(req, false);
    if (cart) removeItem(cart.id, intParam(req.params.id));
    go(res, "/cart");
  });

  app.post("/cart/items/:id/accept", (req, res) => {
    const cart = currentCart(req, false);
    if (!cart) {
      go(res, "/cart");
      return;
    }
    const result = acceptItemPrice(cart.id, intParam(req.params.id));
    setFlash(req, result.ok ? "info" : "error", result.ok ? "바뀐 가격으로 맞춰 두었습니다." : result.error);
    go(res, "/cart");
  });

  app.get("/checkout", (req, res) => {
    const loaded = loadCheckout(req, req.query.buy === "1" ? "buy" : "cart");
    if (loaded.redirect) {
      setFlash(req, "error", loaded.message);
      go(res, loaded.redirect);
      return;
    }
    send(res, layout(req, { title: "주문서", main: checkoutMain(req, loaded, {}, "") }));
  });

  app.post("/checkout/accept", (req, res) => {
    const buy = req.session.data.buyNow;
    if (!buy) {
      go(res, "/cart");
      return;
    }
    const resolved = resolveCartItem(buy);
    if (!resolved.problems.includes("price")) {
      go(res, "/checkout?buy=1");
      return;
    }
    req.session.data.buyNow = { ...buy, seen_price: resolved.unitPrice };
    setFlash(req, "info", "바뀐 가격으로 맞춰 두었습니다.");
    go(res, "/checkout?buy=1");
  });

  app.post("/checkout", (req, res) => {
    const idemKey = String(req.body.idem_key || "");
    const replay = replayOrder(req, idemKey);
    if (replay) {
      go(res, `/orders/${replay.order_no}?placed=1`);
      return;
    }
    const mode = req.body.checkout_mode === "buy" ? "buy" : "cart";
    const loaded = loadCheckout(req, mode);
    if (loaded.redirect) {
      setFlash(req, "error", loaded.message);
      go(res, loaded.redirect);
      return;
    }
    if (loaded.blocked || loaded.lines.some((line) => line.problems.length)) {
      send(
        res,
        layout(req, {
          title: "주문서",
          main: checkoutMain(req, loaded, {}, "상품 금액이나 재고를 확인하기 전에는 결제할 수 없습니다."),
        }),
        409,
      );
      return;
    }
    const { errors, address, buyerName, buyerPhone, memo, paymentMethod } = readCheckoutForm(req);
    if (Object.keys(errors).length) {
      send(res, layout(req, { title: "주문서", main: checkoutMain(req, loaded, errors, "입력한 내용을 다시 확인해 주세요.") }), 422);
      return;
    }
    if (paymentMethod === "card") {
      const payment = assessCardPayment(req.body.card_number);
      if (!payment.ok) {
        if (payment.field) errors.card_number = payment.error;
        const banner = payment.declined ? payment.error : "입력한 내용을 다시 확인해 주세요.";
        send(res, layout(req, { title: "주문서", main: checkoutMain(req, loaded, errors, banner) }), 422);
        return;
      }
    }
    const expected = Number(String(req.body.expected_total ?? "").replace(/[^\d]/g, ""));
    const result = placeOrder({
      lines: loaded.lines,
      idemKey,
      userId: req.user?.id ?? null,
      buyerName,
      buyerPhone,
      buyerEmail: req.user?.email || "",
      paymentMethod,
      expectedTotal: expected,
      postalCode: address.postal_code,
      recipient: address.recipient,
      recipientPhone: address.phone,
      address1: address.address1,
      address2: address.address2,
      memo,
      clearCartId: mode === "cart" ? loaded.cartId : null,
    });
    if (result.replay) {
      const order = getOrderByNo(result.orderNo);
      if (order && (canViewOrder(order, req) || req.session.data.idemKey === idemKey)) {
        if (!req.user) rememberGuestOrder(req, order.order_no);
        req.session.data.justOrdered = order.order_no;
        go(res, `/orders/${order.order_no}?placed=1`);
        return;
      }
      send(
        res,
        layout(req, {
          title: "주문서",
          main: `<h1>이미 처리된 결제 요청입니다</h1><p><a href="/orders/lookup">주문 조회</a></p>`,
        }),
        409,
      );
      return;
    }
    if (!result.ok) {
      if (result.code === "stock") {
        const text = (result.items || [])
          .map((item) => `${item.name}${item.optionLabel ? ` (${item.optionLabel})` : ""} 재고가 ${item.stock}개라 결제하지 않았습니다.`)
          .join(" ");
        const fresh = loadCheckout(req, mode);
        if (fresh.redirect) {
          setFlash(req, "error", text || "재고가 부족해 결제하지 않았습니다.");
          go(res, fresh.redirect);
          return;
        }
        send(
          res,
          layout(req, {
            title: "주문서",
            main: checkoutMain(req, fresh, errors, text || "재고가 부족해 결제하지 않았습니다."),
          }),
          409,
        );
        return;
      }
      const fresh = loadCheckout(req, mode);
      if (fresh.redirect) {
        setFlash(req, "error", "금액이나 재고가 바뀌어 결제를 진행하지 않았습니다. 장바구니를 다시 확인해 주세요.");
        go(res, fresh.redirect);
        return;
      }
      send(
        res,
        layout(req, {
          title: "주문서",
          main: checkoutMain(req, fresh, errors, "금액이 바뀌어 결제를 진행하지 않았습니다. 아래 금액으로 다시 확인해 주세요."),
        }),
        409,
      );
      return;
    }
    if (req.user && req.body.save_address === "1" && req.body.address_choice === "new") {
      saveAddress(req.user.id, address);
    }
    if (req.user && buyerPhone && !req.user.phone) {
      getDb().prepare("UPDATE users SET phone = ? WHERE id = ?").run(buyerPhone, req.user.id);
      req.user.phone = buyerPhone;
    }
    if (mode === "buy") delete req.session.data.buyNow;
    if (!req.user) rememberGuestOrder(req, result.orderNo);
    req.session.data.justOrdered = result.orderNo;
    go(res, `/orders/${result.orderNo}?placed=1`);
  });

  app.get("/orders/lookup", (req, res) => {
    send(res, layout(req, { title: "주문 조회", main: lookupForm(req, {}, "") }));
  });

  app.post("/orders/lookup", (req, res) => {
    const orderNo = String(req.body.order_no ?? "").trim();
    const phone = normalizePhone(req.body.phone);
    const order = orderNo ? getOrderByNo(orderNo) : null;
    if (!order || order.buyer_phone !== phone) {
      send(
        res,
        layout(req, {
          title: "주문 조회",
          main: lookupForm(req, { order_no: orderNo, phone: req.body.phone || "" }, "주문 정보를 확인할 수 없습니다."),
        }),
        422,
      );
      return;
    }
    rememberGuestOrder(req, order.order_no);
    go(res, `/orders/${order.order_no}`);
  });

  app.get("/orders/:orderNo", (req, res) => {
    const order = getOrderByNo(req.params.orderNo);
    if (!canViewOrder(order, req)) {
      send(res, layout(req, { title: "주문", main: `<h1>주문을 찾을 수 없습니다</h1><p><a href="/orders/lookup">주문 조회</a></p>` }), 404);
      return;
    }
    const justPlaced = req.session.data.justOrdered === order.order_no;
    if (justPlaced) delete req.session.data.justOrdered;
    send(res, layout(req, { title: "주문", main: orderDetail(req, order, justPlaced) }));
  });

  app.post("/orders/:orderNo/cancel", (req, res) => {
    const order = getOrderByNo(req.params.orderNo);
    if (!canViewOrder(order, req)) {
      send(res, layout(req, { title: "주문", main: `<h1>주문을 찾을 수 없습니다</h1>` }), 404);
      return;
    }
    if (!canCustomerCancel(order.status)) {
      setFlash(req, "error", "지금은 직접 취소할 수 없습니다.");
      go(res, `/orders/${order.order_no}`);
      return;
    }
    const result = cancelOrder(order.id);
    setFlash(
      req,
      result.ok ? "info" : "error",
      result.ok ? "주문을 취소했고 결제 취소와 재고 복구까지 마쳤습니다." : "취소를 끝내지 못했습니다. 고객센터로 문의해 주세요.",
    );
    go(res, `/orders/${order.order_no}`);
  });

  app.get("/terms", (req, res) => {
    send(res, layout(req, { title: "이용약관", main: legal("이용약관", termsText()) }));
  });
  app.get("/privacy", (req, res) => {
    send(res, layout(req, { title: "개인정보 처리방침", main: legal("개인정보 처리방침", privacyText()) }));
  });
  app.get("/commerce", (req, res) => {
    send(res, layout(req, { title: "전자상거래 고지", main: legal("전자상거래 고지", commerceText()) }));
  });
  app.get("/help", (req, res) => {
    const settings = getSettings();
    send(
      res,
      layout(req, {
        title: "고객센터",
        main: `<h1>고객센터</h1><div class="note"><p>${textToHtml(settings.customerCenterNotice)}</p></div>
          <p>결제 완료와 상품 준비 중에는 주문 화면에서 직접 취소할 수 있습니다. 배송이 시작된 뒤에는 반품·교환 신청 화면이 없고, 고객센터 안내만 보여 드립니다.</p>`,
      }),
    );
  });
}

function addOrBuy(req, res, mode) {
  const product = getProduct(intParam(req.params.id));
  if (!product || product.status !== "selling") {
    setFlash(req, "error", "구매할 수 없는 상품입니다.");
    go(res, product ? `/products/${product.id}` : "/");
    return;
  }
  const qty = parseQty(req.body.qty);
  const variantId = product.has_variants ? intParam(req.body.variant_id) : null;
  if (product.has_variants && !variantId) {
    setFlash(req, "error", "옵션을 선택해 주세요.");
    go(res, `/products/${product.id}`);
    return;
  }
  if (mode === "buy") {
    const inspected = inspectPurchase({ productId: product.id, variantId, qty });
    if (!inspected.ok) {
      setFlash(req, "error", inspected.error);
      go(res, `/products/${product.id}`);
      return;
    }
    req.session.data.buyNow = inspected.line;
    go(res, "/checkout?buy=1");
    return;
  }
  const cart = currentCart(req, true);
  const result = addItem(cart.id, { productId: product.id, variantId, qty });
  if (!result.ok) {
    setFlash(req, "error", result.error);
    go(res, `/products/${product.id}`);
    return;
  }
  setFlash(req, "info", "장바구니에 담았습니다.");
  go(res, "/cart");
}

function currentCart(req, create) {
  if (req.user) return getCartRecord({ userId: req.user.id, create });
  return getCartRecord({ sessionId: req.session.id, create });
}

function cartBody(req, lines) {
  if (!lines.length) {
    return `<div class="empty"><h1>장바구니가 비어 있습니다</h1><a class="btn" href="/">상품 보러 가기</a></div>`;
  }
  const settings = getSettings();
  const blocked = lines.some((line) => line.problems.length);
  const merchandise = lines.reduce((sum, line) => sum + (line.problems.includes("unavailable") ? 0 : line.lineTotal), 0);
  const quote = quoteShipping(merchandise, "", settings);
  const rows = lines.map((line) => cartLine(req, line)).join("");
  const checkout = blocked
    ? `<p class="field-error">문제가 있는 상품이 남아 있으면 주문서로 갈 수 없습니다.</p><button class="btn" type="button" disabled>주문하기</button>`
    : `<a class="btn" href="/checkout">주문하기</a>`;
  return `<h1>장바구니</h1>
    <p class="muted">로그인하지 않아도 주문할 수 있습니다. 서로 다른 분류의 상품도 배송비 한 번으로 같이 주문합니다.</p>
    <ul class="cart-list">${rows}</ul>
    <aside class="summary">
      <p><span>상품 금액</span><strong>${won(merchandise)}</strong></p>
      <p><span>배송비</span><strong>${won(quote.fee)}</strong></p>
      <p class="muted">${esc(cartShippingNote(merchandise, settings))}</p>
      <p class="total"><span>예상 결제 금액</span><strong>${won(merchandise + quote.fee)}</strong></p>
      ${checkout}
    </aside>`;
}

function cartLine(req, line) {
  const problems = problemText(line)
    .map((message) => `<p class="field-error">${esc(message)}</p>`)
    .join("");
  const accept = line.problems.includes("price")
    ? `<form method="post" action="/cart/items/${line.id}/accept">${csrfInput(req)}<button class="btn secondary" type="submit">바뀐 가격으로 맞추기</button></form>`
    : "";
  const option = line.optionLabel ? `<p class="muted">${esc(line.optionLabel)}</p>` : "";
  return `<li class="cart-line">
    <img src="/media/products/${line.productId}.svg" alt="${esc(line.name)}">
    <div>
      <p class="brand">${esc(line.brand)}</p>
      <a href="/products/${line.productId}">${esc(line.name)}</a>
      ${option}
      <p>단가 ${won(line.unitPrice)}</p>
      ${problems}
      ${accept}
    </div>
    <form method="post" action="/cart/items/${line.id}" class="qty-form">
      ${csrfInput(req)}
      <label class="sr" for="qty-${line.id}">수량</label>
      <input id="qty-${line.id}" name="qty" type="number" min="1" max="${MAX_LINE_QTY}" value="${line.qty}">
      <button class="btn secondary" type="submit">수량 변경</button>
    </form>
    <p class="line-total">${won(line.lineTotal)}</p>
    <form method="post" action="/cart/items/${line.id}/delete">${csrfInput(req)}<button class="linkish" type="submit">삭제</button></form>
  </li>`;
}

function loadCheckout(req, mode) {
  if (mode === "buy") {
    const buy = req.session.data.buyNow;
    if (!buy) return { redirect: "/", message: "바로 구매할 상품이 없습니다." };
    const line = resolveCartItem(buy);
    const blocked = line.problems.length > 0;
    return { mode, lines: [line], cartId: null, blocked };
  }
  const cart = currentCart(req, false);
  const lines = cart ? listResolvedCart(cart.id) : [];
  if (!lines.length) return { redirect: "/cart", message: "장바구니가 비어 있습니다." };
  if (lines.some((line) => line.problems.length)) {
    return { redirect: "/cart", message: "문제가 있는 상품이 있어 주문서로 이동하지 않았습니다." };
  }
  return { mode, lines, cartId: cart.id, blocked: false };
}

function ensureIdem(req, mode) {
  const key = req.session.data.idemKey;
  const used = key ? getDb().prepare("SELECT 1 FROM checkout_keys WHERE key = ?").get(key) : null;
  if (!/^[a-f0-9]{32}$/.test(key || "") || req.session.data.idemMode !== mode || used) {
    req.session.data.idemKey = randomToken(16);
    req.session.data.idemMode = mode;
  }
  return req.session.data.idemKey;
}

function replayOrder(req, idemKey) {
  if (!/^[a-f0-9]{32}$/.test(idemKey) || req.session.data.idemKey !== idemKey) return null;
  const row = getDb().prepare("SELECT order_id FROM checkout_keys WHERE key = ?").get(idemKey);
  if (!row) return null;
  const order = getDb().prepare("SELECT * FROM orders WHERE id = ?").get(row.order_id);
  if (!order) return null;
  if (!req.user) rememberGuestOrder(req, order.order_no);
  req.session.data.justOrdered = order.order_no;
  return order;
}

function readCheckoutForm(req) {
  const errors = {};
  const choice = req.body.address_choice || "new";
  let address = null;
  if (req.user && choice !== "new") {
    const saved = getDb()
      .prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?")
      .get(Number(choice), req.user.id);
    if (!saved) errors.address_choice = "배송지를 다시 선택해 주세요.";
    else {
      address = {
        recipient: saved.recipient,
        phone: saved.phone,
        postal_code: saved.postal_code,
        address1: saved.address1,
        address2: saved.address2,
      };
    }
  } else {
    const recipient = clip(req.body.recipient, 40);
    const address1 = clip(req.body.address1, 120);
    const address2 = clip(req.body.address2, 120);
    const postal = String(req.body.postal_code ?? "").trim();
    if (recipient === null) errors.recipient = "수령인은 40자 안으로 입력해 주세요.";
    else if (!recipient) errors.recipient = "수령인을 입력해 주세요.";
    if (!validPhone(req.body.recipient_phone)) errors.recipient_phone = "배송 연락처를 확인해 주세요.";
    if (!validPostal(postal)) errors.postal_code = "우편번호 5자리를 입력해 주세요.";
    if (address1 === null) errors.address1 = "주소는 120자 안으로 입력해 주세요.";
    else if (!address1) errors.address1 = "주소를 입력해 주세요.";
    if (address2 === null) errors.address2 = "상세 주소는 120자 안으로 입력해 주세요.";
    else if (!address2) errors.address2 = "상세 주소를 입력해 주세요. 없으면 없음이라고 적어 주세요.";
    if (!errors.recipient && !errors.recipient_phone && !errors.postal_code && !errors.address1 && !errors.address2) {
      address = {
        recipient,
        phone: normalizePhone(req.body.recipient_phone),
        postal_code: postal,
        address1,
        address2,
      };
    }
  }
  const buyerNameRaw = clip(req.body.buyer_name, 40);
  if (buyerNameRaw === null) errors.buyer_name = "주문자 이름은 40자 안으로 입력해 주세요.";
  if (!validPhone(req.body.buyer_phone)) errors.buyer_phone = "주문자 연락처를 입력해 주세요.";
  const memoRaw = clip(req.body.memo, 200);
  if (memoRaw === null) errors.memo = "배송 메모는 200자 안으로 입력해 주세요.";
  const paymentMethod = req.body.payment;
  if (paymentMethod !== "card" && paymentMethod !== "easypay") errors.payment = "카드 또는 간편결제를 선택해 주세요.";
  if (paymentMethod === "card" && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(req.body.card_expiry ?? "").trim())) {
    errors.card_expiry = "유효기간을 MM/YY 형식으로 입력해 주세요.";
  }
  if (req.body.agree !== "1") errors.agree = "주문 고지를 확인하고 동의해 주세요.";
  return {
    errors,
    address,
    buyerName: buyerNameRaw || "",
    buyerPhone: normalizePhone(req.body.buyer_phone),
    memo: memoRaw || "",
    paymentMethod,
  };
}

function formValues(req) {
  return {
    address_choice: req.body?.address_choice || "",
    recipient: req.body?.recipient || "",
    recipient_phone: req.body?.recipient_phone || "",
    postal_code: req.body?.postal_code || "",
    address1: req.body?.address1 || "",
    address2: req.body?.address2 || "",
    buyer_name: req.body?.buyer_name || req.user?.name || "",
    buyer_phone: req.body?.buyer_phone || (req.user?.phone ? formatPhone(req.user.phone) : ""),
    memo: req.body?.memo || "",
    payment: req.body?.payment || "card",
    agree: req.body?.agree === "1",
    save_address: req.body?.save_address === "1",
  };
}

function checkoutMain(req, loaded, errors, banner) {
  const settings = getSettings();
  const values = formValues(req);
  const selectedPostal = selectedPostalCode(req, values);
  const merchandise = loaded.lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const quote = quoteShipping(merchandise, selectedPostal, settings);
  const idemKey = ensureIdem(req, loaded.mode);
  const blocked = loaded.blocked;
  const saved = req.user
    ? getDb().prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC").all(req.user.id)
    : [];
  const defaultChoice = values.address_choice || (saved[0] ? String(saved[0].id) : "new");
  const addressFields = addressSection(req, saved, defaultChoice, values, errors);
  const lines = loaded.lines
    .map((line) => {
      const option = line.optionLabel ? ` · ${esc(line.optionLabel)}` : "";
      return `<li><span>${esc(line.brand)} ${esc(line.name)}${option} × ${line.qty}</span><span>${won(line.lineTotal)}</span></li>`;
    })
    .join("");
  const problems = loaded.lines
    .flatMap((line) => problemText(line).map((message) => `<p class="field-error">${esc(line.name)}: ${esc(message)}</p>`))
    .join("");
  const accept = loaded.mode === "buy" && loaded.lines.some((line) => line.problems.includes("price"))
    ? `<form method="post" action="/checkout/accept">${csrfInput(req)}<button class="btn secondary" type="submit">변경된 금액으로 계속</button></form>`
    : "";
  const payDisabled = blocked ? " disabled" : "";
  return `<h1>주문서</h1>
    ${banner ? `<p class="flash error" role="alert">${esc(banner)}</p>` : ""}
    ${problems}
    ${accept}
    <div class="checkout">
      <form method="post" action="/checkout" data-once>
        ${csrfInput(req)}
        <input type="hidden" name="checkout_mode" value="${loaded.mode}">
        <input type="hidden" name="idem_key" value="${esc(idemKey)}">
        <input type="hidden" name="expected_total" value="${merchandise + quote.fee}">
        <fieldset>
          <legend>주문자</legend>
          <label for="buyer_name">이름</label>
          <input id="buyer_name" name="buyer_name" value="${esc(values.buyer_name)}" maxlength="40" autocomplete="name">
          ${fieldError(errors, "buyer_name")}
          <label for="buyer_phone">연락처</label>
          <input id="buyer_phone" name="buyer_phone" value="${esc(values.buyer_phone)}" inputmode="tel" autocomplete="tel" required aria-describedby="${errors.buyer_phone ? "buyer_phone-err" : ""}">
          ${fieldError(errors, "buyer_phone")}
          <p class="field-hint">비회원 주문 조회에 이 연락처와 주문 번호를 함께 씁니다.</p>
        </fieldset>
        ${addressFields}
        <fieldset>
          <legend>배송 메모</legend>
          <label for="memo">메모 (선택)</label>
          <input id="memo" name="memo" value="${esc(values.memo)}" maxlength="200">
          ${fieldError(errors, "memo")}
        </fieldset>
        <fieldset>
          <legend>결제</legend>
          <label class="choice"><input type="radio" name="payment" value="card"${values.payment === "card" ? " checked" : ""}> 카드</label>
          <label class="choice"><input type="radio" name="payment" value="easypay"${values.payment === "easypay" ? " checked" : ""}> 간편결제</label>
          ${fieldError(errors, "payment")}
          <div class="card-fields">
            <label for="card_number">카드 번호</label>
            <input id="card_number" name="card_number" inputmode="numeric" autocomplete="off" placeholder="숫자만, 승인 후 저장하지 않습니다">
            ${fieldError(errors, "card_number")}
            <label for="card_expiry">유효기간</label>
            <input id="card_expiry" name="card_expiry" placeholder="MM/YY" autocomplete="off">
            ${fieldError(errors, "card_expiry")}
            <p class="field-hint">이 화면의 결제는 즉시 승인 데모입니다. 카드 번호가 0000으로 끝나면 승인이 거절되고 주문은 만들어지지 않습니다. 무통장 입금은 없습니다.</p>
          </div>
        </fieldset>
        <fieldset>
          <legend>주문 확인</legend>
          <label class="choice"><input type="checkbox" name="agree" value="1"${values.agree ? " checked" : ""}> 주문 내용과 아래 고지를 확인했습니다.</label>
          ${fieldError(errors, "agree")}
          <p><a href="/terms">이용약관</a> · <a href="/privacy">개인정보 처리방침</a> · <a href="/commerce">전자상거래 고지</a></p>
        </fieldset>
        <button class="btn" type="submit"${payDisabled}>${won(merchandise + quote.fee)} 결제하기</button>
      </form>
      <aside class="summary" id="summary"
        data-threshold="${settings.freeShippingThreshold}"
        data-base="${settings.baseShippingFee}"
        data-remote="${settings.remoteSurcharge}"
        data-prefixes="${esc(JSON.stringify(settings.remotePrefixes))}"
        data-merch="${merchandise}">
        <h2>결제 금액</h2>
        <ul class="plain">${lines}</ul>
        <p><span>상품 금액</span><strong data-merch-text>${won(merchandise)}</strong></p>
        <p><span>배송비</span><strong data-fee>${won(quote.fee)}</strong></p>
        <p class="muted" data-fee-detail>${esc(shippingDetail(quote))}</p>
        <p class="total"><span>최종 결제 금액</span><strong data-total>${won(merchandise + quote.fee)}</strong></p>
      </aside>
    </div>`;
}

function selectedPostalCode(req, values) {
  const choice = values.address_choice;
  if (req.user && choice && choice !== "new") {
    const saved = getDb()
      .prepare("SELECT postal_code FROM addresses WHERE id = ? AND user_id = ?")
      .get(Number(choice), req.user.id);
    if (saved) return saved.postal_code;
  }
  if (!choice && req.user && req.method === "GET") {
    const saved = getDb()
      .prepare("SELECT postal_code FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC")
      .get(req.user.id);
    if (saved) return saved.postal_code;
  }
  return String(values.postal_code || "").trim();
}

function addressSection(req, saved, defaultChoice, values, errors) {
  const choices = saved
    .map((address) => {
      const checked = String(address.id) === String(defaultChoice) ? " checked" : "";
      return `<label class="choice">
        <input type="radio" name="address_choice" value="${address.id}" data-postal="${esc(address.postal_code)}"${checked}>
        <span><strong>${esc(address.recipient)}</strong> ${esc(formatPhone(address.phone))}<br>
        ${esc(address.postal_code)} ${esc(address.address1)} ${esc(address.address2)}</span>
      </label>`;
    })
    .join("");
  const newChecked = !saved.length || defaultChoice === "new" ? " checked" : "";
  const newRadio = req.user
    ? `<label class="choice"><input type="radio" name="address_choice" value="new"${newChecked}> 새 배송지</label>`
    : `<input type="hidden" name="address_choice" value="new">`;
  const saveBox = req.user
    ? `<label class="choice"><input type="checkbox" name="save_address" value="1"${values.save_address ? " checked" : ""}> 이 배송지를 다음에도 쓰기</label>`
    : "";
  return `<fieldset>
    <legend>배송지</legend>
    ${choices}
    ${newRadio}
    ${fieldError(errors, "address_choice")}
    <div class="new-address">
      <label for="recipient">수령인</label>
      <input id="recipient" name="recipient" value="${esc(values.recipient)}" autocomplete="shipping name" maxlength="40">
      ${fieldError(errors, "recipient")}
      <label for="recipient_phone">배송 연락처</label>
      <input id="recipient_phone" name="recipient_phone" value="${esc(values.recipient_phone)}" inputmode="tel" autocomplete="shipping tel">
      ${fieldError(errors, "recipient_phone")}
      <label for="postal_code">우편번호</label>
      <input id="postal_code" name="postal_code" value="${esc(values.postal_code)}" inputmode="numeric" maxlength="5" autocomplete="shipping postal-code">
      ${fieldError(errors, "postal_code")}
      <label for="address1">주소</label>
      <input id="address1" name="address1" value="${esc(values.address1)}" autocomplete="shipping street-address" maxlength="120">
      ${fieldError(errors, "address1")}
      <label for="address2">상세 주소</label>
      <input id="address2" name="address2" value="${esc(values.address2)}" autocomplete="shipping address-line2" maxlength="120">
      ${fieldError(errors, "address2")}
      ${saveBox}
    </div>
  </fieldset>`;
}

function saveAddress(userId, address) {
  const database = getDb();
  const count = database.prepare("SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?").get(userId).n;
  if (count === 0) {
    database.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId);
  }
  database
    .prepare(
      `INSERT INTO addresses (user_id, recipient, phone, postal_code, address1, address2, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      userId,
      address.recipient,
      address.phone,
      address.postal_code,
      address.address1,
      address.address2,
      count === 0 ? 1 : 0,
    );
}

function lookupForm(req, values, banner) {
  return `<h1>주문 조회</h1>
    <p>주문 번호와 주문자 연락처가 모두 맞을 때만 주문을 보여 드립니다.</p>
    ${banner ? `<p class="flash error" role="alert">${esc(banner)}</p>` : ""}
    <form method="post" action="/orders/lookup" class="stack">
      ${csrfInput(req)}
      <label for="order_no">주문 번호</label>
      <input id="order_no" name="order_no" value="${esc(values.order_no || "")}" autocomplete="off" required>
      <label for="phone">주문자 연락처</label>
      <input id="phone" name="phone" value="${esc(values.phone || "")}" inputmode="tel" autocomplete="tel" required>
      <button class="btn" type="submit">조회</button>
    </form>`;
}

function orderDetail(req, order, justPlaced) {
  const items = orderItems(order.id);
  const rows = items
    .map((item) => {
      const product = item.product_id ? getProduct(item.product_id) : null;
      const name = product && product.status === "selling"
        ? `<a href="/products/${product.id}">${esc(item.name)}</a>`
        : esc(item.name);
      const option = item.option_label ? `<p class="muted">${esc(item.option_label)}</p>` : "";
      return `<li><div><p class="brand">${esc(item.brand)}</p>${name}${option}</div><span>${won(item.unit_price)} × ${item.qty}</span><strong>${won(item.unit_price * item.qty)}</strong></li>`;
    })
    .join("");
  const settings = getSettings();
  let action = "";
  if (canCustomerCancel(order.status)) {
    action = `<form method="post" action="/orders/${esc(order.order_no)}/cancel" data-confirm="결제를 취소하고 이 주문을 취소합니다.">
      ${csrfInput(req)}
      <button class="btn secondary" type="submit">주문 취소</button>
    </form>`;
  } else if (order.status === "shipping" || order.status === "delivered") {
    action = `<aside class="note"><h2>취소와 반품</h2><p>${textToHtml(settings.customerCenterNotice)}</p></aside>`;
  } else if (order.status === "cancel_error") {
    action = `<aside class="note"><p>취소를 끝내지 못했습니다. ${textToHtml(settings.customerCenterNotice)}</p></aside>`;
  }
  const placed = justPlaced ? `<p class="flash info" role="status">결제가 승인되었습니다. 주문 번호를 기억해 두세요.</p>` : "";
  const tracking = order.tracking_no ? `<p>송장 번호 ${esc(order.tracking_no)}</p>` : "";
  return `${placed}
    <p class="eyebrow">주문 번호</p>
    <h1 class="order-no">${esc(order.order_no)}</h1>
    <p class="status">${esc(orderStatus(order.status))}</p>
    <p>결제 ${esc(PAYMENT_LABEL[order.payment_method] || order.payment_method)} · ${order.payment_status === "approved" ? "승인됨" : "취소됨"} · ${esc(when(order.created_at))}</p>
    ${tracking}
    <ul class="order-lines">${rows}</ul>
    <aside class="summary">
      <p><span>상품 금액</span><strong>${won(order.merchandise_total)}</strong></p>
      <p><span>배송비</span><strong>${won(order.shipping_fee)}</strong></p>
      <p class="muted">${esc(shippingDetail({ base: order.shipping_base, remote: order.shipping_remote, fee: order.shipping_fee }))}</p>
      <p class="total"><span>결제 금액</span><strong>${money(order.total)}</strong></p>
    </aside>
    <section>
      <h2>배송지</h2>
      <p>${esc(order.recipient)} · ${esc(formatPhone(order.recipient_phone))}</p>
      <p>${esc(order.postal_code)} ${esc(order.address1)} ${esc(order.address2)}</p>
      ${order.memo ? `<p>메모 ${esc(order.memo)}</p>` : ""}
      <p>주문자 연락처 ${esc(formatPhone(order.buyer_phone))}</p>
    </section>
    ${action}`;
}

function legal(title, paragraphs) {
  return `<h1>${esc(title)}</h1><p class="muted">데모 상점을 돌리기 위한 안내 문안입니다.</p>${paragraphs
    .map((paragraph) => `<p>${esc(paragraph)}</p>`)
    .join("")}`;
}

function termsText() {
  return [
    "정석몰은 한 운영 주체가 여러 브랜드의 일반 상품을 판매하는 쇼핑몰입니다. 입점 판매자 계정은 없습니다.",
    "회원은 이메일과 비밀번호로 가입합니다. 소셜 로그인은 제공하지 않습니다. 비회원도 주문할 수 있습니다.",
    "판매 가격은 화면에 보이는 금액입니다. 결제 직전에 그 금액 위로 세금을 다시 더하지 않습니다.",
    "장바구니에 담긴 상품은 분류가 달라도 주문 하나, 배송비 하나, 출고 하나로 처리합니다.",
    "결제 완료와 상품 준비 중에는 고객이 직접 주문을 취소할 수 있습니다. 배송 중 이후에는 직접 취소하지 않습니다.",
  ];
}

function privacyText() {
  return [
    "주문과 회원 가입을 위해 이메일, 이름, 연락처, 배송지, 주문 내용을 이 상점의 데이터베이스에 저장합니다.",
    "카드 번호와 유효기간은 승인 여부를 확인하는 데만 쓰고 주문 기록에 남기지 않습니다.",
    "비회원 주문은 주문 번호와 주문자 연락처가 모두 일치할 때만 보여 줍니다. 하나라도 다르면 주문을 보여 주지 않습니다.",
    "회원은 자신의 주문과 배송지만 볼 수 있습니다. 관리자 계정은 고객 가입으로 만들어지지 않습니다.",
  ];
}

function commerceText() {
  return [
    "판매자는 정석몰입니다. 이 데모에는 사업자등록번호를 적지 않습니다. 세금계산서와 현금영수증 신청은 받지 않습니다.",
    "결제는 카드 또는 간편결제의 즉시 승인만 됩니다. 무통장 입금과 입금 대기 상태는 없습니다.",
    "청약 철회는 출고 전, 곧 결제 완료와 상품 준비 중에 주문 취소로 할 수 있습니다. 배송이 시작된 뒤의 반품과 교환은 신청 화면 없이 고객센터 안내만 제공합니다.",
    "배송비는 주문 금액이 무료배송 기준 이상이면 기본 배송비가 없고, 도서산간은 추가 배송비가 붙을 수 있습니다. 기준 금액과 배송비는 운영 설정을 따릅니다.",
  ];
}
