import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApp } from "../src/app.js";
import { getDb, initDb } from "../src/db.js";

const dir = mkdtempSync(path.join(tmpdir(), "jeongseok-"));
initDb(path.join(dir, "mall.db"));
const server = createApp().listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

class Jar {
  constructor() {
    this.map = new Map();
  }
  store(response) {
    const cookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
    for (const cookie of cookies) {
      const pair = cookie.split(";")[0];
      const index = pair.indexOf("=");
      this.map.set(pair.slice(0, index), pair.slice(index + 1));
    }
  }
  header() {
    return [...this.map].map(([key, value]) => `${key}=${value}`).join("; ");
  }
}

function assert(condition, message, extra = "") {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    if (extra) console.error(extra.slice(0, 900));
    throw new Error(message);
  }
  console.log(`ok: ${message}`);
}

function pathOf(location) {
  if (!location) return "";
  if (location.startsWith("http")) {
    const url = new URL(location);
    return `${url.pathname}${url.search}`;
  }
  return location;
}

async function send(jar, urlPath, options = {}) {
  const headers = {};
  if (jar.header()) headers.cookie = jar.header();
  let body;
  if (options.form) {
    headers["content-type"] = "application/x-www-form-urlencoded; charset=UTF-8";
    body = new URLSearchParams(options.form);
  }
  const response = await fetch(`${base}${urlPath}`, {
    method: options.method || "GET",
    headers,
    body,
    redirect: "manual",
  });
  jar.store(response);
  return {
    status: response.status,
    text: await response.text(),
    location: pathOf(response.headers.get("location")),
  };
}

async function follow(jar, response) {
  if (response.status >= 300 && response.status < 400 && response.location) {
    return send(jar, response.location);
  }
  return response;
}

function csrfOf(html) {
  const match = html.match(/name="csrf" value="([^"]+)"/);
  if (!match) throw new Error("csrf missing");
  return match[1];
}

function hidden(html, name) {
  const match = html.match(new RegExp(`name="${name}" value="([^"]*)"`));
  return match ? match[1] : "";
}

function productByName(name) {
  return getDb().prepare("SELECT * FROM products WHERE name = ?").get(name);
}

function variantOf(name, color, size = "") {
  return getDb()
    .prepare(
      `SELECT v.* FROM variants v
       JOIN products p ON p.id = v.product_id
       WHERE p.name = ? AND v.color = ? AND v.size = ?`,
    )
    .get(name, color, size);
}

function stockOf(name, color = null, size = "") {
  if (color === null) return productByName(name).stock;
  return variantOf(name, color, size).stock;
}

function checkoutForm(html, extra = {}) {
  return {
    csrf: csrfOf(html),
    idem_key: hidden(html, "idem_key"),
    expected_total: hidden(html, "expected_total"),
    checkout_mode: hidden(html, "checkout_mode") || "cart",
    buyer_name: "김정석",
    buyer_phone: "01012345678",
    address_choice: "new",
    recipient: "김정석",
    recipient_phone: "01098765432",
    postal_code: "04524",
    address1: "서울특별시 중구 세종대로 110",
    address2: "1층",
    memo: "부재 시 경비실",
    payment: "easypay",
    agree: "1",
    ...extra,
  };
}

async function addSimple(jar, name, qty = 1) {
  const product = productByName(name);
  const page = await send(jar, `/products/${product.id}`);
  return send(jar, `/products/${product.id}/add`, {
    method: "POST",
    form: { csrf: csrfOf(page.text), qty: String(qty) },
  });
}

async function addVariant(jar, name, color, size = "", qty = 1, mode = "add") {
  const product = productByName(name);
  const variant = variantOf(name, color, size);
  const page = await send(jar, `/products/${product.id}`);
  return send(jar, `/products/${product.id}/${mode}`, {
    method: "POST",
    form: { csrf: csrfOf(page.text), qty: String(qty), variant_id: String(variant.id) },
  });
}

try {
  const home = await send(new Jar(), "/");
  assert(home.status === 200, "home opens");
  assert(home.text.includes("분류 1") && home.text.includes("분류 2") && home.text.includes("분류 3"), "home shows placeholder categories");
  assert(home.text.includes("매일 면 수건 2장") && home.text.includes("코튼 반팔 티셔츠"), "home shows products");
  assert(!home.text.includes("준비 중인 담요"), "stopped product is not on the home list");

  const cat1 = await send(new Jar(), "/c/cat-1");
  assert(cat1.text.includes("매일 면 수건 2장") && cat1.text.includes("데일리 텀블러"), "category 1 lists its products");
  assert(!cat1.text.includes("코튼 반팔 티셔츠"), "category 1 does not list another category");
  const cat2 = await send(new Jar(), "/c/cat-2");
  assert(cat2.text.includes("코튼 반팔 티셔츠") && cat2.text.includes("리넨 파우치"), "category 2 lists a sold-out product");
  assert(cat2.text.includes("품절"), "sold-out product is marked");

  const emptySearch = await send(new Jar(), "/search?q=%20%20");
  assert(emptySearch.text.includes("검색어를 입력해 주세요"), "blank search asks for a query");
  const found = await send(new Jar(), "/search?q=텀블러");
  assert(found.text.includes("데일리 텀블러") && found.text.includes("보람") && found.text.includes("분류 1"), "search shows name, brand, and category");
  const missing = await send(new Jar(), "/search?q=없는물건");
  assert(missing.text.includes("없는물건") && missing.text.includes("없습니다"), "empty search keeps the query");
  const stoppedSearch = await send(new Jar(), "/search?q=담요");
  assert(!stoppedSearch.text.includes("준비 중인 담요"), "search skips stopped products");

  const stopped = productByName("준비 중인 담요");
  const stoppedPage = await send(new Jar(), `/products/${stopped.id}`);
  assert(stoppedPage.text.includes("구매할 수 없는 상품"), "direct link of a stopped product cannot be bought");
  assert(!stoppedPage.text.includes("장바구니 담기"), "stopped product has no add button");

  const guest = new Jar();
  const navy = await follow(guest, await addVariant(guest, "데일리 텀블러", "네이비"));
  assert(navy.text.includes("품절인 옵션"), "sold-out option cannot be added");

  const tooMany = await follow(guest, await addSimple(guest, "매일 면 수건 2장", 41));
  assert(tooMany.text.includes("재고가"), "quantity above stock is rejected");

  const towelBefore = stockOf("매일 면 수건 2장");
  const penBefore = stockOf("부드러운 젤펜", "블랙");
  await follow(guest, await addSimple(guest, "매일 면 수건 2장", 1));
  await follow(guest, await addVariant(guest, "부드러운 젤펜", "블랙"));
  const cart = await send(guest, "/cart");
  assert(cart.text.includes("매일 면 수건 2장") && cart.text.includes("부드러운 젤펜"), "cart holds both categories");
  assert(cart.text.includes("배송비") && cart.text.includes("3,000원"), "cart shows one base shipping fee under the threshold");
  assert(cart.text.includes("도서산간"), "cart says the remote surcharge is confirmed at checkout");

  const checkout = await send(guest, "/checkout");
  assert(!checkout.text.includes("위시리스트") && !checkout.text.includes('name="coupon"'), "checkout has no wishlist or coupon");
  assert(checkout.text.includes("카드") && checkout.text.includes("간편결제"), "checkout offers card and easy pay");
  const invalid = await send(guest, "/checkout", {
    method: "POST",
    form: { ...checkoutForm(checkout.text), buyer_phone: "", agree: "" },
  });
  assert(invalid.status === 422 && invalid.text.includes("연락처"), "checkout requires the buyer phone");

  const ordersBeforeDecline = getDb().prepare("SELECT COUNT(*) AS n FROM orders").get().n;
  const declined = await send(guest, "/checkout", {
    method: "POST",
    form: checkoutForm(checkout.text, { payment: "card", card_number: "4242424242420000", card_expiry: "12/30" }),
  });
  assert(declined.status === 422 && declined.text.includes("거절"), "card ending 0000 is declined");
  assert(getDb().prepare("SELECT COUNT(*) AS n FROM orders").get().n === ordersBeforeDecline, "declined payment creates no order");
  assert(stockOf("매일 면 수건 2장") === towelBefore, "declined payment does not take stock");

  const paid = await send(guest, "/checkout", { method: "POST", form: checkoutForm(checkout.text) });
  assert(paid.status === 303, "easy pay redirects to the order", paid.text);
  const orderNo = paid.location.split("/").pop().split("?")[0];
  const orderPage = await send(guest, paid.location);
  assert(orderPage.text.includes(orderNo) && orderPage.text.includes("결제 완료"), "order confirmation shows the number and paid status");
  assert(orderPage.text.includes("매일 면 수건 2장") && orderPage.text.includes("부드러운 젤펜"), "order snapshots both lines");
  const order = getDb().prepare("SELECT * FROM orders WHERE order_no = ?").get(orderNo);
  const items = getDb().prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  const categories = new Set(
    items.map((item) => getDb().prepare("SELECT category_id FROM products WHERE id = ?").get(item.product_id).category_id),
  );
  assert(items.length === 2 && categories.size === 2, "one order contains two categories");
  assert(order.shipping_fee === 3000 && order.total === order.merchandise_total + 3000, "one shipping fee is added");
  assert(order.payment_status === "approved" && order.status === "paid", "payment is approved immediately");
  assert(stockOf("매일 면 수건 2장") === towelBefore - 1, "simple product stock decreases");
  assert(stockOf("부드러운 젤펜", "블랙") === penBefore - 1, "variant stock decreases");
  assert(!JSON.stringify(order).includes("4242"), "card number is not stored");

  const again = await send(guest, "/checkout", { method: "POST", form: checkoutForm(checkout.text) });
  assert(again.status === 303 && again.location.includes(orderNo), "repeating the same payment returns the same order");
  assert(getDb().prepare("SELECT COUNT(*) AS n FROM orders WHERE order_no = ?").get(orderNo).n === 1, "only one order row exists");
  assert(stockOf("매일 면 수건 2장") === towelBefore - 1, "replay does not take stock twice");

  const stranger = new Jar();
  const wrong = await send(stranger, "/orders/lookup", {
    method: "POST",
    form: { csrf: csrfOf((await send(stranger, "/orders/lookup")).text), order_no: orderNo, phone: "01000000000" },
  });
  assert(wrong.status === 422 && wrong.text.includes("주문 정보를 확인할 수 없습니다"), "wrong phone is rejected");
  assert(!wrong.text.includes("세종대로") && !wrong.text.includes(order.address1), "wrong phone does not reveal the address");
  const wrongNo = await send(stranger, "/orders/lookup", {
    method: "POST",
    form: { csrf: csrfOf(wrong.text), order_no: "JS20000101-ABCDEF", phone: "01012345678" },
  });
  assert(wrongNo.text.includes("주문 정보를 확인할 수 없습니다"), "wrong order number uses the same message");
  const lookedUp = await follow(
    stranger,
    await send(stranger, "/orders/lookup", {
      method: "POST",
      form: { csrf: csrfOf(wrongNo.text), order_no: orderNo, phone: "010-1234-5678" },
    }),
  );
  assert(lookedUp.text.includes(orderNo) && lookedUp.text.includes("세종대로"), "order number plus phone opens the order");

  const hiddenFromOther = await send(new Jar(), `/orders/${orderNo}`);
  assert(hiddenFromOther.status === 404, "order URL alone does not open a guest order");

  const cancelPage = await send(guest, `/orders/${orderNo}`);
  const cancelled = await follow(
    guest,
    await send(guest, `/orders/${orderNo}/cancel`, { method: "POST", form: { csrf: csrfOf(cancelPage.text) } }),
  );
  assert(cancelled.text.includes("취소됨"), "customer can cancel a paid order");
  assert(getDb().prepare("SELECT status, payment_status FROM orders WHERE order_no = ?").get(orderNo).payment_status === "cancelled", "payment is cancelled with the order");
  assert(stockOf("매일 면 수건 2장") === towelBefore && stockOf("부드러운 젤펜", "블랙") === penBefore, "cancel restores stock");

  const prep = new Jar();
  const noteBefore = stockOf("무선 노트 3권");
  await follow(prep, await addSimple(prep, "무선 노트 3권"));
  const prepCheckout = await send(prep, "/checkout");
  const prepPaid = await follow(prep, await send(prep, "/checkout", { method: "POST", form: checkoutForm(prepCheckout.text, { buyer_phone: "01022223333" }) }));
  const prepNo = (prepPaid.text.match(/JS\d{8}-[A-F0-9]{6}/) || [])[0];
  const prepOrder = getDb().prepare("SELECT * FROM orders WHERE order_no = ?").get(prepNo);
  const admin = new Jar();
  const adminLogin = await send(admin, "/admin/login");
  const adminIn = await follow(
    admin,
    await send(admin, "/admin/login", {
      method: "POST",
      form: { csrf: csrfOf(adminLogin.text), email: "admin@jeongseok.local", password: "jeongseok-admin" },
    }),
  );
  assert(adminIn.text.includes("상품 등록"), "admin can open the product list");
  const preparing = await follow(
    admin,
    await send(admin, `/admin/orders/${prepOrder.id}`, {
      method: "POST",
      form: { csrf: csrfOf((await send(admin, `/admin/orders/${prepOrder.id}`)).text), action: "preparing", tracking_no: "" },
    }),
  );
  assert(preparing.text.includes("상품 준비 중"), "admin moves the order to preparing");
  const customerPrep = await send(prep, `/orders/${prepNo}`);
  assert(customerPrep.text.includes("상품 준비 중") && customerPrep.text.includes("/cancel"), "customer sees preparing and can still cancel");
  const customerCancelled = await follow(
    prep,
    await send(prep, `/orders/${prepNo}/cancel`, { method: "POST", form: { csrf: csrfOf(customerPrep.text) } }),
  );
  assert(customerCancelled.text.includes("취소됨"), "customer can cancel while preparing");
  assert(stockOf("무선 노트 3권") === noteBefore, "preparing cancel restores stock");

  const ship = new Jar();
  const teeBefore = stockOf("코튼 반팔 티셔츠", "화이트", "M");
  await follow(ship, await addVariant(ship, "코튼 반팔 티셔츠", "화이트", "M", 2));
  const shipCheckout = await send(ship, "/checkout");
  assert(hidden(shipCheckout.text, "expected_total") === "64000", "two shirts are over the free-shipping threshold");
  const mismatch = await send(ship, "/checkout", {
    method: "POST",
    form: checkoutForm(shipCheckout.text, { postal_code: "63243", address1: "제주시 첨단로 242", buyer_phone: "01033334444" }),
  });
  assert(mismatch.status === 409 && mismatch.text.includes("금액이 바뀌어"), "remote postal stops payment until the new total is shown");
  const remotePaid = await follow(
    ship,
    await send(ship, "/checkout", {
      method: "POST",
      form: checkoutForm(mismatch.text, { postal_code: "63243", address1: "제주시 첨단로 242", buyer_phone: "01033334444" }),
    }),
  );
  const shipNo = (remotePaid.text.match(/JS\d{8}-[A-F0-9]{6}/) || [])[0];
  const shipOrder = getDb().prepare("SELECT * FROM orders WHERE order_no = ?").get(shipNo);
  assert(shipOrder.shipping_base === 0 && shipOrder.shipping_remote === 4000 && shipOrder.shipping_fee === 4000, "free shipping still adds the remote surcharge");
  assert(shipOrder.total === 68000, "one total includes merchandise and the single shipping fee");
  assert(stockOf("코튼 반팔 티셔츠", "화이트", "M") === teeBefore - 2, "variant quantity is deducted");
  await send(admin, `/admin/orders/${shipOrder.id}`, {
    method: "POST",
    form: { csrf: csrfOf((await send(admin, `/admin/orders/${shipOrder.id}`)).text), action: "preparing", tracking_no: "" },
  });
  await send(admin, `/admin/orders/${shipOrder.id}`, {
    method: "POST",
    form: { csrf: csrfOf((await send(admin, `/admin/orders/${shipOrder.id}`)).text), action: "shipping", tracking_no: "DEMO-100" },
  });
  const shippingPage = await send(ship, `/orders/${shipNo}`);
  assert(shippingPage.text.includes("배송 중") && shippingPage.text.includes("DEMO-100"), "customer sees the shipping status and tracking text");
  assert(!shippingPage.text.includes(`/orders/${shipNo}/cancel`), "shipping order has no cancel button");
  assert(shippingPage.text.includes("이 화면에서 취소할 수 없습니다"), "shipping order shows the customer-center notice");

  const priceJar = new Jar();
  const bag = productByName("가벼운 에코백");
  const originalPrice = bag.price;
  await follow(priceJar, await addSimple(priceJar, "가벼운 에코백"));
  getDb().prepare("UPDATE products SET price = ? WHERE id = ?").run(originalPrice + 1000, bag.id);
  const changedCart = await send(priceJar, "/cart");
  assert(changedCart.text.includes("바뀌었습니다"), "cart flags a price change");
  const blocked = await send(priceJar, "/checkout");
  assert(blocked.status === 303, "price change blocks checkout");
  const acceptForm = changedCart.text.match(/action="(\/cart\/items\/\d+\/accept)"/);
  assert(acceptForm, "cart offers price acknowledgement");
  await follow(priceJar, await send(priceJar, acceptForm[1], { method: "POST", form: { csrf: csrfOf(changedCart.text) } }));
  const priced = await send(priceJar, "/checkout");
  const pricedPay = await follow(priceJar, await send(priceJar, "/checkout", { method: "POST", form: checkoutForm(priced.text, { buyer_phone: "01055556666" }) }));
  const pricedNo = (pricedPay.text.match(/JS\d{8}-[A-F0-9]{6}/) || [])[0];
  const pricedOrder = getDb().prepare("SELECT unit_price FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_no = ?)").get(pricedNo);
  assert(pricedOrder.unit_price === originalPrice + 1000, "order keeps the price the customer accepted");
  getDb().prepare("UPDATE products SET price = ? WHERE id = ?").run(originalPrice, bag.id);

  const member = new Jar();
  await follow(member, await addSimple(member, "매일 면 수건 2장"));
  const signupPage = await send(member, "/signup");
  const joined = await follow(
    member,
    await send(member, "/signup", {
      method: "POST",
      form: {
        csrf: csrfOf(signupPage.text),
        email: "shopper@example.com",
        name: "이가을",
        password: "password123",
        password_confirm: "password123",
      },
    }),
  );
  assert(joined.text.includes("프로필"), "signup logs the customer in");
  const merged = await send(member, "/cart");
  assert(merged.text.includes("매일 면 수건 2장"), "guest cart is merged after signup");
  const memberCheckout = await send(member, "/checkout");
  const memberPaid = await follow(
    member,
    await send(member, "/checkout", {
      method: "POST",
      form: checkoutForm(memberCheckout.text, { buyer_phone: "01077778888", save_address: "1" }),
    }),
  );
  const memberNo = (memberPaid.text.match(/JS\d{8}-[A-F0-9]{6}/) || [])[0];
  const myOrders = await send(member, "/account/orders");
  assert(myOrders.text.includes(memberNo), "member sees the order in the account");
  const other = new Jar();
  const otherSignup = await send(other, "/signup");
  await follow(
    other,
    await send(other, "/signup", {
      method: "POST",
      form: {
        csrf: csrfOf(otherSignup.text),
        email: "other@example.com",
        name: "박다른",
        password: "password123",
        password_confirm: "password123",
      },
    }),
  );
  const denied = await send(other, `/orders/${memberNo}`);
  assert(denied.status === 404 && !denied.text.includes("01077778888"), "another member cannot open the order");
  const forbidden = await send(other, "/admin/products");
  assert(forbidden.status === 403, "customer cannot open admin");

  const deleteBlocked = await send(member, "/account/delete", {
    method: "POST",
    form: { csrf: csrfOf((await send(member, "/account/delete")).text), confirm: "탈퇴" },
  });
  assert(deleteBlocked.status === 409 && deleteBlocked.text.includes(memberNo), "open order blocks account deletion");

  const buyJar = new Jar();
  const bought = await follow(buyJar, await addVariant(buyJar, "데일리 텀블러", "아이보리", "", 1, "buy"));
  assert(bought.text.includes("데일리 텀블러") && bought.text.includes("주문서"), "buy now opens checkout for that product");
  const buyPaid = await follow(buyJar, await send(buyJar, "/checkout", { method: "POST", form: checkoutForm(bought.text, { buyer_phone: "01088889999" }) }));
  assert((buyPaid.text.match(/데일리 텀블러/g) || []).length >= 1, "buy now creates an order");
  const buyCart = await send(buyJar, "/cart");
  assert(buyCart.text.includes("비어 있습니다"), "buy now does not leave the item in the cart");

  const created = await send(admin, "/admin/products", {
    method: "POST",
    form: {
      csrf: csrfOf((await send(admin, "/admin/products/new")).text),
      brand: "한결",
      name: "검증용 머그",
      description: "검증에서 등록한 단품입니다.",
      status: "selling",
      category_id: String(productByName("무선 노트 3권").category_id),
      price: "11000",
      stock: "4",
    },
  });
  const createdPage = await follow(admin, created);
  assert(createdPage.status === 200 && createdPage.text.includes("검증용 머그"), "admin can register a simple product", created.text);
  const visible = await send(new Jar(), "/search?q=검증용");
  assert(visible.text.includes("검증용 머그") && visible.text.includes("한결"), "new product appears in search");

  const catPage = await send(admin, "/admin/categories");
  const renamed = await follow(
    admin,
    await send(admin, "/admin/categories/3", {
      method: "POST",
      form: { csrf: csrfOf(catPage.text), name: "분류 삼" },
    }),
  );
  assert(renamed.text.includes("분류 삼"), "admin can rename a category");
  const renamedHome = await send(new Jar(), "/");
  assert(renamedHome.text.includes("분류 삼"), "renamed category shows in the shop");

  console.log("verified");
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}
