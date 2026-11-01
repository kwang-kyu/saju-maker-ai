import path from "node:path";
import express from "express";
import { layout } from "./html.js";
import { createSession, loadSession, loadUser, readCookie, saveSession, setSessionCookie } from "./session.js";
import { registerAccount } from "./routes/account.js";
import { registerAdmin } from "./routes/admin.js";
import { registerStorefront } from "./routes/storefront.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    next();
  });
  app.use("/static", express.static(path.join(import.meta.dirname, "..", "public")));
  app.get("/favicon.ico", (req, res) => {
    res.redirect(302, "/static/favicon.svg");
  });
  app.use(express.urlencoded({ extended: false, limit: "200kb" }));
  app.use((req, res, next) => {
    if (req.path.startsWith("/static") || req.path === "/favicon.ico") {
      next();
      return;
    }
    const existing = loadSession(readCookie(req, "sid"));
    const session = existing || createSession();
    if (!existing) setSessionCookie(res, session.id);
    req.session = session;
    req.user = loadUser(session.userId);
    if (session.userId && !req.user) session.userId = null;
    const end = res.end.bind(res);
    let saved = false;
    res.end = (...args) => {
      if (!saved) {
        saved = true;
        try {
          saveSession(req.session);
        } catch (error) {
          console.error(error);
        }
      }
      return end(...args);
    };
    next();
  });
  app.use((req, res, next) => {
    if (req.method !== "POST" || !req.session) {
      next();
      return;
    }
    if (req.body?.csrf && req.body.csrf === req.session.csrf) {
      next();
      return;
    }
    res
      .status(403)
      .type("html")
      .send(layout(req, { title: "오류", main: "<h1>요청을 확인할 수 없습니다</h1><p>페이지를 새로고침한 뒤 다시 시도해 주세요.</p>" }));
  });

  registerStorefront(app);
  registerAccount(app);
  registerAdmin(app);

  app.use((req, res) => {
    if (!req.session) {
      res.status(404).type("text").send("not found");
      return;
    }
    res.status(404).type("html").send(layout(req, { title: "없음", main: `<h1>페이지를 찾을 수 없습니다</h1><p><a href="/">홈으로</a></p>` }));
  });
  app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) {
      next(error);
      return;
    }
    if (!req.session) {
      res.status(500).type("text").send("error");
      return;
    }
    res.status(500).type("html").send(layout(req, { title: "오류", main: "<h1>오류가 발생했습니다</h1><p>잠시 후 다시 시도해 주세요.</p>" }));
  });
  return app;
}
