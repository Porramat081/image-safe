// backend/src/routes/images.ts
//
// WHAT  GET /images (keyset-paginated list, newest first) and DELETE /images/:id.
// HOW   GET takes ?limit= and ?cursor=; returns { images, next_cursor }. Pass next_cursor
//       back as ?cursor= for the following page. DELETE removes bytes then the row.
// WHY   Keyset (cursor) pagination stays fast at any depth, unlike OFFSET which scans and
//       discards skipped rows — central to the "large volume" requirement (ARCHITECTURE §3.6).
// ALTERNATIVES
//   - OFFSET/LIMIT: lets you jump to an arbitrary page, but gets linearly slower as you page deeper.
//   - Delete order: storage BEFORE the DB row, so a failed storage delete doesn't orphan bytes.

import { Router } from "express";
import { pool } from "../db/client";
import { storage } from "../services/storage";
import { HttpError } from "../middleware/errorHandler";
import type { ImageRecord, ImageListResponse } from "@image-hosting/shared/types/api";

export const imagesRouter = Router();

// A DB row is mostly the response shape already; normalize the timestamp to an ISO string.
function toRecord(row: any): ImageRecord {
  return {
    id: row.id,
    filename: row.filename,
    public_url: row.public_url,
    size: row.size,
    mime_type: row.mime_type,
    status: row.status,
    uploaded_at:
      row.uploaded_at instanceof Date ? row.uploaded_at.toISOString() : String(row.uploaded_at),
  };
}

// The cursor encodes the sort key of the last row returned: (uploaded_at, id).
function encodeCursor(uploadedAt: string, id: string): string {
  return Buffer.from(`${uploadedAt}|${id}`).toString("base64url");
}
function decodeCursor(cursor: string): { uploadedAt: string; id: string } {
  const [uploadedAt, id] = Buffer.from(cursor, "base64url").toString("utf8").split("|");
  return { uploadedAt, id };
}

// GET /images?limit=&cursor=
imagesRouter.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100);
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

    // Fetch limit + 1: the extra row tells us whether a next page exists.
    let result;
    if (cursor) {
      const { uploadedAt, id } = decodeCursor(cursor);
      result = await pool.query(
        `SELECT * FROM images
         WHERE (uploaded_at, id) < ($1, $2)
         ORDER BY uploaded_at DESC, id DESC
         LIMIT $3`,
        [uploadedAt, id, limit + 1]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM images ORDER BY uploaded_at DESC, id DESC LIMIT $1`,
        [limit + 1]
      );
    }

    const rows = result.rows;
    let next_cursor: string | null = null;
    if (rows.length > limit) {
      const last = rows[limit - 1];
      const lastTs =
        last.uploaded_at instanceof Date ? last.uploaded_at.toISOString() : String(last.uploaded_at);
      next_cursor = encodeCursor(lastTs, last.id);
      rows.length = limit; // drop the probe row before responding
    }

    const body: ImageListResponse = { images: rows.map(toRecord), next_cursor };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

// DELETE /images/:id
imagesRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const found = await pool.query(`SELECT storage_key FROM images WHERE id = $1`, [id]);
    if (found.rowCount === 0) throw new HttpError(404, "Image not found");

    await storage.deleteFile(found.rows[0].storage_key); // storage first…
    await pool.query(`DELETE FROM images WHERE id = $1`, [id]); // …then the row
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
