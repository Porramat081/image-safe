// backend/src/routes/serve.ts
//
// WHAT  GET /i/:id — the public, shareable link for an image.
// HOW   Mounted at /i. In R2 mode it 302-redirects to the stored public/CDN URL; in
//       local-disk mode it streams the file off disk (local disk has no public host).
// WHY   Gives every image a STABLE link (/i/abc123) decoupled from where the bytes live,
//       so shared links survive a storage/CDN change.
// ALTERNATIVES (ARCHITECTURE §3.4)
//   - High-traffic public host: skip the backend on reads entirely — hand the client the
//     CDN URL directly so views are edge-cached and never hit your origin.
//   - Always stream through the backend: enables access control, but costs CPU + egress per view.

import { Router } from "express";
import { createReadStream } from "fs";
import { pool } from "../db/client";
import { env } from "../config/env";
import { HttpError } from "../middleware/errorHandler";
import { localFilePath } from "../services/localDisk";

export const serveRouter = Router();

serveRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT storage_key, public_url, mime_type FROM images WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) throw new HttpError(404, "Image not found");
    const row = result.rows[0];

    // Prod: bounce to the CDN/storage URL (cheap; bytes never flow through us).
    if (env.STORAGE_DRIVER === "r2") {
      return res.redirect(302, row.public_url);
    }

    // Dev (local disk): stream the file. Immutable cache header because the id->bytes
    // mapping never changes.
    res.setHeader("Content-Type", row.mime_type);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    const stream = createReadStream(localFilePath(row.storage_key));
    stream.on("error", next); // e.g. file missing on disk -> 500 via errorHandler
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});
