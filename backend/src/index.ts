// backend/src/index.ts
//
// WHAT  The composition root: wires config → middleware → routes → error handler and
//       starts the HTTP server.
// HOW   Read top to bottom like a table of contents. It only imports collaborators and
//       arranges them; it holds no business logic of its own.
// WHY   Centralizing wiring makes the app's structure visible at a glance and keeps the
//       order-sensitive bits (error handler last) in one obvious place.
// ALTERNATIVES
//   - Scatter app.use(...) across files / glob-autoload routes: less boilerplate, but the
//     startup order and full route list become implicit. Explicit wiring is worth it.

import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { env } from "./config/env";
import { pool } from "./db/client";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { uploadRouter } from "./routes/upload";
import { imagesRouter } from "./routes/images";
import { serveRouter } from "./routes/serve";

// Run migrations before starting the server
async function runMigrations() {
  try {
    const migrationFile = join(__dirname, "db", "migrations", "001_create_images.sql");
    const sql = readFileSync(migrationFile, "utf-8");
    await pool.query(sql);
    console.log("✓ Migrations applied successfully");
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  }
}

const app = express();

app.use(corsMiddleware);
app.use(express.json());

// Liveness probe (useful for Docker/PaaS health checks).
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/upload", uploadRouter);
app.use("/images", imagesRouter);
app.use("/i", serveRouter);

// MUST be last: catches errors thrown/forwarded by every route above.
app.use(errorHandler);

// Run migrations and start server
(async () => {
  await runMigrations();
  app.listen(env.PORT, () => {
    console.log(
      `API listening on http://localhost:${env.PORT} (storage driver: ${env.STORAGE_DRIVER})`
    );
  });
})();

