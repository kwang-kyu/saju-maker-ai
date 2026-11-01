import { getDb } from "../db.js";
import { hashPassword, randomToken, verifyPassword } from "../auth.js";
import { rotateSession, destroySession, clearSessionCookie } from "../session.js";
import { csrfInput, fieldError, layout, orderStatus, setFlash, when } from "../html.js";
import { clip, esc, formatPhone, normalizeEmail, normalizePhone, validEmail, validPhone, validPostal, won } from "../util.js";

function send(res, body, status = 200) {
  res.status(status).type("html").send(body);
}

function go(res, location) {
  res.redirect(303, location);
}

function safeNext(value) {
  const text = String(value || "");
  if (!text.startsWith("/") || text.startsWith("//") || text.includes("\\")) return "/account";
  return text;
}

function requireUser(req, res, next) {
  if (!req.user || req.user.role === "admin") {
    if (!req.user) {
      setFlash(req, "error", "로그인해 주세요.");
      go(res, `/login?next=${encodeURIComponent(req.originalUrl)}`);
      return;
    }
  }
  if (!req.user) return;
  next();
}

export function registerAccount(app) {
  app.get("/signup", (req, res) => {
    if (req.user) return go(res, "/account");
    send(res, layout(req, { title: "회원가입", main: authCard("회원가입", signupForm(req, {}, {})) }));
  });

  app.post("/signup", (req, res) => {
    if (req.user) return go(res, "/account");
    const errors = {};
    const email = normalizeEmail(req.body.email);
    const name = clip(req.body.name, 40);
    const password = String(req.body.password ?? "");
    const confirm = String(req.body.password_confirm ?? "");
    if (!validEmail(email) || email.length > 120) errors.email = "이메일을 확인해 주세요.";
    if (name === null) errors.name = "이름은 40자 안으로 입력해 주세요.";
    if (password.length < 8 || password.length > 200) errors.password = "비밀번호는 8자 이상으로 정해 주세요.";
    if (password !== confirm) errors.password_confirm = "비밀번호 확인이 일치하지 않습니다.";
    const database = getDb();
    if (!errors.email && database.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      errors.email = "이미 가입된 이메일입니다.";
    }
    if (Object.keys(errors).length) {
      send(res, layout(req, { title: "회원가입", main: authCard("회원가입", signupForm(req, { email, name: req.body.name || "" }, errors)) }), 422);
      return;
    }
    const info = database
      .prepare(
        `INSERT INTO users (email, password_hash, name, phone, role, created_at)
         VALUES (?, ?, ?, '', 'customer', ?)`,
      )
      .run(email, hashPassword(password), name || "", new Date().toISOString());
    const user = database.prepare("SELECT * FROM users WHERE id = ?").get(Number(info.lastInsertRowid));
    rotateSession(req, res, user);
    setFlash(req, "info", "가입했습니다. 이제 주문과 배송지를 이 계정에서 볼 수 있습니다.");
    go(res, "/account");
  });

  app.get("/login", (req, res) => {
    if (req.user) return go(res, safeNext(req.query.next));
    send(res, layout(req, { title: "로그인", main: authCard("로그인", loginForm(req, String(req.query.next || ""), {})) }));
  });

  app.post("/login", (req, res) => {
    const next = safeNext(req.body.next);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? "");
    const user = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      send(
        res,
        layout(req, {
          title: "로그인",
          main: authCard("로그인", loginForm(req, req.body.next || "", { form: "이메일 또는 비밀번호가 올바르지 않습니다." }, email)),
        }),
        422,
      );
      return;
    }
    rotateSession(req, res, user);
    go(res, user.role === "admin" ? "/admin/products" : next);
  });

  app.post("/logout", (req, res) => {
    destroySession(req.session);
    clearSessionCookie(res);
    go(res, "/");
  });

  app.get("/forgot", (req, res) => {
    send(res, layout(req, { title: "비밀번호 재설정", main: authCard("비밀번호 재설정", forgotForm(req, "", "")) }));
  });

  app.post("/forgot", (req, res) => {
    const email = normalizeEmail(req.body.email);
    let extra = "";
    if (validEmail(email)) {
      const user = getDb().prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (user) {
        const token = randomToken(24);
        const expires = Date.now() + 60 * 60 * 1000;
        getDb().prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);
        getDb().prepare("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, user.id, expires);
        extra = `<p>이 실행 환경은 메일을 보내지 않습니다. 한 시간 안에 아래 링크로 비밀번호를 바꾸세요.</p><p><a href="/reset/${token}">비밀번호 재설정 링크</a></p>`;
      }
    }
    send(
      res,
      layout(req, {
        title: "비밀번호 재설정",
        main: authCard("비밀번호 재설정", `<p>계정이 있으면 재설정 방법을 이 화면에 보여 드립니다.</p>${extra}`),
      }),
    );
  });

  app.get("/reset/:token", (req, res) => {
    if (!resetUser(req.params.token)) {
      send(res, layout(req, { title: "비밀번호 재설정", main: `<h1>링크가 유효하지 않습니다</h1><p><a href="/forgot">다시 요청</a></p>` }), 400);
      return;
    }
    send(res, layout(req, { title: "비밀번호 재설정", main: authCard("새 비밀번호", resetForm(req, {})) }));
  });

  app.post("/reset/:token", (req, res) => {
    const user = resetUser(req.params.token);
    if (!user) {
      send(res, layout(req, { title: "비밀번호 재설정", main: `<h1>링크가 유효하지 않습니다</h1>` }), 400);
      return;
    }
    const password = String(req.body.password ?? "");
    const confirm = String(req.body.password_confirm ?? "");
    const errors = {};
    if (password.length < 8 || password.length > 200) errors.password = "비밀번호는 8자 이상으로 정해 주세요.";
    if (password !== confirm) errors.password_confirm = "비밀번호 확인이 일치하지 않습니다.";
    if (Object.keys(errors).length) {
      send(res, layout(req, { title: "비밀번호 재설정", main: authCard("새 비밀번호", resetForm(req, errors)) }), 422);
      return;
    }
    getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), user.id);
    getDb().prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);
    setFlash(req, "info", "비밀번호를 바꿨습니다. 로그인해 주세요.");
    go(res, "/login");
  });

  app.get("/account", requireUser, (req, res) => {
    send(res, layout(req, { title: "마이페이지", main: accountShell(req, profileForm(req, {})) }));
  });

  app.post("/account", requireUser, (req, res) => {
    const errors = {};
    const name = clip(req.body.name, 40);
    const phoneRaw = String(req.body.phone ?? "").trim();
    if (name === null) errors.name = "이름은 40자 안으로 입력해 주세요.";
    if (phoneRaw && !validPhone(phoneRaw)) errors.phone = "연락처를 확인해 주세요.";
    if (Object.keys(errors).length) {
      send(res, layout(req, { title: "마이페이지", main: accountShell(req, profileForm(req, errors, { name: req.body.name || "", phone: phoneRaw })) }), 422);
      return;
    }
    const phone = phoneRaw ? normalizePhone(phoneRaw) : "";
    getDb().prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?").run(name || "", phone, req.user.id);
    req.user.name = name || "";
    req.user.phone = phone;
    setFlash(req, "info", "프로필을 저장했습니다.");
    go(res, "/account");
  });

  app.get("/account/orders", requireUser, (req, res) => {
    const orders = getDb().prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
    const list = orders.length
      ? `<ul class="order-index">${orders
          .map(
            (order) => `<li><a href="/orders/${esc(order.order_no)}"><strong>${esc(order.order_no)}</strong></a>
              <span>${esc(orderStatus(order.status))}</span><span>${won(order.total)}</span><span>${esc(when(order.created_at))}</span></li>`,
          )
          .join("")}</ul>`
      : `<p>아직 주문한 내역이 없습니다.</p>`;
    send(res, layout(req, { title: "내 주문", main: accountShell(req, `<h2>내 주문</h2>${list}`) }));
  });

  app.get("/account/addresses", requireUser, (req, res) => {
    send(res, layout(req, { title: "배송지", main: accountShell(req, addressManager(req, {}, {})) }));
  });

  app.post("/account/addresses", requireUser, (req, res) => {
    const parsed = readAddress(req);
    if (Object.keys(parsed.errors).length) {
      send(res, layout(req, { title: "배송지", main: accountShell(req, addressManager(req, parsed.errors, parsed.values)) }), 422);
      return;
    }
    storeAddress(req.user.id, null, parsed.address);
    setFlash(req, "info", "배송지를 저장했습니다.");
    go(res, "/account/addresses");
  });

  app.get("/account/addresses/:id", requireUser, (req, res) => {
    const address = ownAddress(req, req.params.id);
    if (!address) {
      send(res, layout(req, { title: "배송지", main: `<h1>배송지를 찾을 수 없습니다</h1>` }), 404);
      return;
    }
    send(res, layout(req, { title: "배송지", main: accountShell(req, addressEdit(req, address, {})) }));
  });

  app.post("/account/addresses/:id", requireUser, (req, res) => {
    const address = ownAddress(req, req.params.id);
    if (!address) {
      send(res, layout(req, { title: "배송지", main: `<h1>배송지를 찾을 수 없습니다</h1>` }), 404);
      return;
    }
    const parsed = readAddress(req);
    if (Object.keys(parsed.errors).length) {
      send(res, layout(req, { title: "배송지", main: accountShell(req, addressEdit(req, { ...address, ...parsed.values }, parsed.errors)) }), 422);
      return;
    }
    storeAddress(req.user.id, address.id, parsed.address);
    setFlash(req, "info", "배송지를 수정했습니다.");
    go(res, "/account/addresses");
  });

  app.post("/account/addresses/:id/delete", requireUser, (req, res) => {
    const address = ownAddress(req, req.params.id);
    if (address) getDb().prepare("DELETE FROM addresses WHERE id = ?").run(address.id);
    go(res, "/account/addresses");
  });

  app.get("/account/password", requireUser, (req, res) => {
    send(res, layout(req, { title: "비밀번호", main: accountShell(req, passwordForm(req, {})) }));
  });

  app.post("/account/password", requireUser, (req, res) => {
    const errors = {};
    const current = String(req.body.current_password ?? "");
    const password = String(req.body.password ?? "");
    const confirm = String(req.body.password_confirm ?? "");
    const row = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(req.user.id);
    if (!verifyPassword(current, row.password_hash)) errors.current_password = "현재 비밀번호가 올바르지 않습니다.";
    if (password.length < 8 || password.length > 200) errors.password = "비밀번호는 8자 이상으로 정해 주세요.";
    if (password !== confirm) errors.password_confirm = "비밀번호 확인이 일치하지 않습니다.";
    if (Object.keys(errors).length) {
      send(res, layout(req, { title: "비밀번호", main: accountShell(req, passwordForm(req, errors)) }), 422);
      return;
    }
    getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), req.user.id);
    setFlash(req, "info", "비밀번호를 바꿨습니다.");
    go(res, "/account/password");
  });

  app.get("/account/delete", requireUser, (req, res) => {
    send(res, layout(req, { title: "탈퇴", main: accountShell(req, deleteForm(req, "")) }));
  });

  app.post("/account/delete", requireUser, (req, res) => {
    if (String(req.body.confirm ?? "").trim() !== "탈퇴") {
      send(res, layout(req, { title: "탈퇴", main: accountShell(req, deleteForm(req, "확인 칸에 탈퇴라고 입력해 주세요.")) }), 422);
      return;
    }
    const open = getDb()
      .prepare(
        `SELECT order_no, status FROM orders
         WHERE user_id = ? AND status IN ('paid', 'preparing', 'shipping', 'cancel_error')`,
      )
      .all(req.user.id);
    if (open.length) {
      const list = open.map((order) => `${order.order_no}`).join(", ");
      send(
        res,
        layout(req, {
          title: "탈퇴",
          main: accountShell(req, deleteForm(req, `배송이 끝나지 않았거나 취소가 끝나지 않은 주문이 있어 탈퇴할 수 없습니다. ${list}`)),
        }),
        409,
      );
      return;
    }
    const database = getDb();
    database.exec("BEGIN");
    try {
      database.prepare("DELETE FROM sessions WHERE user_id = ?").run(req.user.id);
      database.prepare("DELETE FROM users WHERE id = ?").run(req.user.id);
      database.exec("COMMIT");
    } catch (error) {
      try {
        database.exec("ROLLBACK");
      } catch {
        /* ignore */
      }
      throw error;
    }
    req.session.destroyed = true;
    clearSessionCookie(res);
    go(res, "/?left=1");
  });
}

function resetUser(token) {
  const row = getDb()
    .prepare(
      `SELECT u.* FROM password_resets r
       JOIN users u ON u.id = r.user_id
       WHERE r.token = ? AND r.expires_at > ?`,
    )
    .get(token, Date.now());
  return row || null;
}

function authCard(title, body) {
  return `<section class="auth"><h1>${esc(title)}</h1>${body}</section>`;
}

function signupForm(req, values, errors) {
  return `<form method="post" action="/signup" class="stack">
    ${csrfInput(req)}
    <label for="email">이메일</label>
    <input id="email" name="email" type="email" autocomplete="email" value="${esc(values.email || "")}" required>
    ${fieldError(errors, "email")}
    <label for="name">이름 (선택)</label>
    <input id="name" name="name" autocomplete="name" value="${esc(values.name || "")}" maxlength="40">
    ${fieldError(errors, "name")}
    <label for="password">비밀번호</label>
    <input id="password" name="password" type="password" autocomplete="new-password" required>
    ${fieldError(errors, "password")}
    <label for="password_confirm">비밀번호 확인</label>
    <input id="password_confirm" name="password_confirm" type="password" autocomplete="new-password" required>
    ${fieldError(errors, "password_confirm")}
    <button class="btn" type="submit">가입하기</button>
    <p>이미 계정이 있으면 <a href="/login">로그인</a></p>
  </form>`;
}

function loginForm(req, next, errors, email = "") {
  return `<form method="post" action="/login" class="stack">
    ${csrfInput(req)}
    <input type="hidden" name="next" value="${esc(next)}">
    ${errors.form ? `<p class="field-error" role="alert">${esc(errors.form)}</p>` : ""}
    <label for="email">이메일</label>
    <input id="email" name="email" type="email" autocomplete="email" value="${esc(email)}" required>
    <label for="password">비밀번호</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>
    <button class="btn" type="submit">로그인</button>
    <p><a href="/signup">회원가입</a> · <a href="/forgot">비밀번호를 잊으셨나요?</a></p>
  </form>`;
}

function forgotForm(req, email, error) {
  return `<form method="post" action="/forgot" class="stack">
    ${csrfInput(req)}
    ${error ? `<p class="field-error">${esc(error)}</p>` : ""}
    <label for="email">이메일</label>
    <input id="email" name="email" type="email" autocomplete="email" value="${esc(email)}" required>
    <button class="btn" type="submit">재설정 안내 보기</button>
  </form>`;
}

function resetForm(req, errors) {
  return `<form method="post" action="/reset/${esc(req.params.token)}" class="stack">
    ${csrfInput(req)}
    <label for="password">새 비밀번호</label>
    <input id="password" name="password" type="password" autocomplete="new-password" required>
    ${fieldError(errors, "password")}
    <label for="password_confirm">비밀번호 확인</label>
    <input id="password_confirm" name="password_confirm" type="password" autocomplete="new-password" required>
    ${fieldError(errors, "password_confirm")}
    <button class="btn" type="submit">저장</button>
  </form>`;
}

function accountShell(req, body) {
  const items = [
    ["/account", "프로필"],
    ["/account/orders", "주문"],
    ["/account/addresses", "배송지"],
    ["/account/password", "비밀번호"],
    ["/account/delete", "탈퇴"],
  ];
  const nav = items
    .map(([href, label]) => {
      const current = req.path === href ? ' aria-current="page"' : "";
      return `<a href="${href}"${current}>${label}</a>`;
    })
    .join("");
  return `<div class="account"><nav class="account-nav" aria-label="마이페이지">${nav}</nav><div>${body}</div></div>`;
}

function profileForm(req, errors, values = null) {
  const name = values ? values.name : req.user.name;
  const phone = values ? values.phone : req.user.phone ? formatPhone(req.user.phone) : "";
  return `<h2>프로필</h2>
    <form method="post" action="/account" class="stack">
      ${csrfInput(req)}
      <label for="email">이메일</label>
      <input id="email" value="${esc(req.user.email)}" disabled>
      <label for="name">이름</label>
      <input id="name" name="name" value="${esc(name)}" maxlength="40">
      ${fieldError(errors, "name")}
      <label for="phone">연락처</label>
      <input id="phone" name="phone" value="${esc(phone)}" inputmode="tel">
      ${fieldError(errors, "phone")}
      <button class="btn" type="submit">저장</button>
    </form>`;
}

function addressManager(req, errors, values) {
  const rows = getDb().prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC").all(req.user.id);
  const list = rows.length
    ? `<ul class="address-list">${rows
        .map(
          (address) => `<li>
            <p><strong>${esc(address.recipient)}</strong> ${address.is_default ? '<span class="badge static">기본</span>' : ""}</p>
            <p>${esc(formatPhone(address.phone))}</p>
            <p>${esc(address.postal_code)} ${esc(address.address1)} ${esc(address.address2)}</p>
            <p><a href="/account/addresses/${address.id}">수정</a></p>
            <form method="post" action="/account/addresses/${address.id}/delete">${csrfInput(req)}<button class="linkish" type="submit">삭제</button></form>
          </li>`,
        )
        .join("")}</ul>`
    : `<p>저장된 배송지가 없습니다.</p>`;
  return `<h2>배송지</h2>${list}<h3>새 배송지</h3>${addressFields(req, "/account/addresses", values, errors, false)}`;
}

function addressEdit(req, address, errors) {
  return `<h2>배송지 수정</h2>${addressFields(req, `/account/addresses/${address.id}`, address, errors, true)}`;
}

function addressFields(req, action, values, errors, editing) {
  return `<form method="post" action="${action}" class="stack">
    ${csrfInput(req)}
    <label for="recipient">수령인</label>
    <input id="recipient" name="recipient" value="${esc(values.recipient || "")}" required maxlength="40">
    ${fieldError(errors, "recipient")}
    <label for="phone">연락처</label>
    <input id="phone" name="phone" value="${esc(values.phone || "")}" required>
    ${fieldError(errors, "phone")}
    <label for="postal_code">우편번호</label>
    <input id="postal_code" name="postal_code" value="${esc(values.postal_code || "")}" required maxlength="5">
    ${fieldError(errors, "postal_code")}
    <label for="address1">주소</label>
    <input id="address1" name="address1" value="${esc(values.address1 || "")}" required maxlength="120">
    ${fieldError(errors, "address1")}
    <label for="address2">상세 주소</label>
    <input id="address2" name="address2" value="${esc(values.address2 || "")}" required maxlength="120">
    ${fieldError(errors, "address2")}
    <label class="choice"><input type="checkbox" name="is_default" value="1" ${values.is_default ? "checked" : ""}> 기본 배송지</label>
    <button class="btn" type="submit">${editing ? "수정" : "추가"}</button>
  </form>`;
}

function readAddress(req) {
  const errors = {};
  const recipient = clip(req.body.recipient, 40);
  const address1 = clip(req.body.address1, 120);
  const address2 = clip(req.body.address2, 120);
  const postal = String(req.body.postal_code ?? "").trim();
  const values = {
    recipient: req.body.recipient || "",
    phone: req.body.phone || "",
    postal_code: postal,
    address1: req.body.address1 || "",
    address2: req.body.address2 || "",
    is_default: req.body.is_default === "1" ? 1 : 0,
  };
  if (recipient === null) errors.recipient = "수령인은 40자 안으로 입력해 주세요.";
  else if (!recipient) errors.recipient = "수령인을 입력해 주세요.";
  if (!validPhone(req.body.phone)) errors.phone = "연락처를 확인해 주세요.";
  if (!validPostal(postal)) errors.postal_code = "우편번호 5자리를 입력해 주세요.";
  if (address1 === null || !address1) errors.address1 = "주소를 입력해 주세요.";
  if (address2 === null || !address2) errors.address2 = "상세 주소를 입력해 주세요.";
  return {
    errors,
    values,
    address: {
      recipient: recipient || "",
      phone: normalizePhone(req.body.phone),
      postal_code: postal,
      address1: address1 || "",
      address2: address2 || "",
      is_default: values.is_default,
    },
  };
}

function storeAddress(userId, id, address) {
  const database = getDb();
  database.exec("BEGIN");
  try {
    if (address.is_default) {
      database.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId);
    }
    if (id) {
      database
        .prepare(
          `UPDATE addresses
           SET recipient = ?, phone = ?, postal_code = ?, address1 = ?, address2 = ?, is_default = ?
           WHERE id = ? AND user_id = ?`,
        )
        .run(
          address.recipient,
          address.phone,
          address.postal_code,
          address.address1,
          address.address2,
          address.is_default,
          id,
          userId,
        );
    } else {
      const count = database.prepare("SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?").get(userId).n;
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
          address.is_default || count === 0 ? 1 : 0,
        );
    }
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

function ownAddress(req, id) {
  if (!/^\d+$/.test(String(id))) return null;
  return getDb().prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?").get(Number(id), req.user.id);
}

function passwordForm(req, errors) {
  return `<h2>비밀번호</h2>
    <form method="post" action="/account/password" class="stack">
      ${csrfInput(req)}
      <label for="current_password">현재 비밀번호</label>
      <input id="current_password" name="current_password" type="password" autocomplete="current-password" required>
      ${fieldError(errors, "current_password")}
      <label for="password">새 비밀번호</label>
      <input id="password" name="password" type="password" autocomplete="new-password" required>
      ${fieldError(errors, "password")}
      <label for="password_confirm">새 비밀번호 확인</label>
      <input id="password_confirm" name="password_confirm" type="password" autocomplete="new-password" required>
      ${fieldError(errors, "password_confirm")}
      <button class="btn" type="submit">바꾸기</button>
    </form>`;
}

function deleteForm(req, error) {
  return `<h2>탈퇴</h2>
    <p>탈퇴하면 이 계정으로 로그인할 수 없습니다. 이미 만든 주문 기록은 조회용으로 남습니다.</p>
    ${error ? `<p class="field-error" role="alert">${esc(error)}</p>` : ""}
    <form method="post" action="/account/delete" class="stack">
      ${csrfInput(req)}
      <label for="confirm">확인을 위해 탈퇴라고 입력</label>
      <input id="confirm" name="confirm" autocomplete="off">
      <button class="btn secondary" type="submit">탈퇴하기</button>
    </form>`;
}
