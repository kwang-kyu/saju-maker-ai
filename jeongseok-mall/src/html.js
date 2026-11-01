import { listCategories } from "./catalog.js";
import { cartQuantity } from "./cart.js";
import { esc, formatWhen, STATUS_LABEL, won } from "./util.js";

export function csrfInput(req) {
  return `<input type="hidden" name="csrf" value="${esc(req.session.csrf)}">`;
}

export function takeFlash(req) {
  const flash = req.session?.data?.flash;
  if (flash) delete req.session.data.flash;
  return flash;
}

export function setFlash(req, type, message) {
  req.session.data.flash = { type, message };
}

export function layout(req, { title, main, subnav = "" }) {
  const categories = listCategories();
  const count = cartQuantity({
    userId: req.user?.id || null,
    sessionId: req.user ? null : req.session.id,
  });
  const flash = takeFlash(req);
  const pageTitle = title ? `${title} · 정석몰` : "정석몰";
  const catLinks = categories
    .map((category) => {
      const href = `/c/${esc(category.slug)}`;
      const current = req.path === `/c/${category.slug}` ? ' aria-current="page"' : "";
      return `<a href="${href}"${current}>${esc(category.name)}</a>`;
    })
    .join("");
  const account = req.user
    ? `<a href="/account">마이페이지</a>
       <form method="post" action="/logout">${csrfInput(req)}<button class="linkish" type="submit">로그아웃</button></form>`
    : `<a href="/login">로그인</a><a href="/signup">회원가입</a>`;
  const adminLink = req.user?.role === "admin" ? `<a href="/admin/products">관리</a>` : "";
  const flashHtml = flash
    ? `<div class="flash ${esc(flash.type)}" role="status">${esc(flash.message)}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(pageTitle)}</title>
  <link rel="stylesheet" href="/static/styles.css">
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
</head>
<body>
  <a class="skip" href="#content">내용으로 건너뛰기</a>
  <header class="site-header">
    <div class="header-row">
      <a class="logo" href="/">정석몰</a>
      <form class="search" action="/search" method="get" role="search">
        <label class="sr" for="q">상품 검색</label>
        <input id="q" name="q" value="${esc(req.query?.q || "")}" placeholder="상품명 검색" maxlength="80">
        <button type="submit">검색</button>
      </form>
      <nav class="util" aria-label="계정과 장바구니">
        <a href="/orders/lookup">주문조회</a>
        <a href="/cart">장바구니${count ? `<span class="count">${count}</span>` : ""}</a>
        ${account}
        ${adminLink}
      </nav>
    </div>
    <nav class="cats" aria-label="상품 분류">${catLinks}</nav>
  </header>
  ${subnav}
  ${flashHtml}
  <main id="content">${main}</main>
  <footer class="site-footer">
    <p>정석몰 · 국내 배송 · 원(KRW)</p>
    <nav aria-label="안내">
      <a href="/terms">이용약관</a>
      <a href="/privacy">개인정보 처리방침</a>
      <a href="/commerce">전자상거래 고지</a>
      <a href="/help">고객센터</a>
    </nav>
  </footer>
  <script src="/static/app.js" defer></script>
</body>
</html>`;
}

export function productCards(products) {
  if (!products.length) return "";
  return `<div class="grid">${products.map(productCard).join("")}</div>`;
}

function productCard(product) {
  const soldout = Number(product.total_stock) <= 0;
  const varied = Number(product.price_count) > 1;
  return `<a class="card" href="/products/${product.id}">
    <span class="photo">
      <img src="/media/products/${product.id}.svg" alt="${esc(product.name)}">
      ${soldout ? '<span class="badge">품절</span>' : ""}
    </span>
    <span class="brand">${esc(product.brand)}</span>
    <span class="name">${esc(product.name)}</span>
    <span class="meta">${esc(product.category_name)}</span>
    <span class="price">${won(product.rep_price)}${varied ? "~" : ""}</span>
  </a>`;
}

export function problemText(line) {
  const messages = [];
  if (line.problems.includes("unavailable")) messages.push("지금은 구매할 수 없습니다. 이 줄을 빼 주세요.");
  if (line.problems.includes("soldout")) messages.push("품절입니다. 이 줄을 빼 주세요.");
  if (line.problems.includes("stock")) messages.push(`재고가 ${line.stock}개입니다. 수량을 줄이거나 빼 주세요.`);
  if (line.problems.includes("limit")) messages.push("한 번에 담을 수 있는 수량을 넘었습니다.");
  if (line.problems.includes("price")) {
    messages.push(`가격이 ${won(line.seenPrice)}에서 ${won(line.unitPrice)}으로 바뀌었습니다. 확인한 뒤에 주문할 수 있습니다.`);
  }
  return messages;
}

export function pager({ page, pageCount, hrefFor }) {
  if (pageCount <= 1) return "";
  const links = [];
  for (let i = 1; i <= pageCount; i += 1) {
    if (i === page) links.push(`<span aria-current="page">${i}</span>`);
    else links.push(`<a href="${hrefFor(i)}">${i}</a>`);
  }
  return `<nav class="pager" aria-label="페이지">${links.join("")}</nav>`;
}

export function fieldError(errors, name) {
  if (!errors?.[name]) return "";
  return `<p class="field-error" id="${esc(name)}-err">${esc(errors[name])}</p>`;
}

export function orderStatus(status) {
  return STATUS_LABEL[status] || status;
}

export function when(iso) {
  return formatWhen(iso);
}

export function money(amount) {
  return won(amount);
}

export function adminSubnav(current) {
  const items = [
    ["/admin/products", "상품"],
    ["/admin/categories", "분류"],
    ["/admin/orders", "주문"],
    ["/admin/settings", "배송 설정"],
  ];
  const links = items
    .map(([href, label]) => {
      const currentAttr = current === href ? ' aria-current="page"' : "";
      return `<a href="${href}"${currentAttr}>${label}</a>`;
    })
    .join("");
  return `<div class="admin-bar"><div class="wrap"><strong>관리</strong><nav>${links}<a href="/">쇼핑몰 보기</a></nav></div></div>`;
}

export function page(req, options) {
  return layout(req, options);
}
