import path from "node:path";
import { createApp } from "./app.js";
import { initDb } from "./db.js";

const dbPath = process.env.DB_PATH || path.join(import.meta.dirname, "..", "data", "mall.db");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

initDb(dbPath);
createApp().listen(port, host, () => {
  console.log(`정석몰 http://${host}:${port}`);
});
