// backend/src/routes/upload.ts
//
// WHAT  POST /upload — the write path. Implemented here as a PROXIED upload (bytes pass
//       through the API), which works identically on local disk and R2.
// HOW   multipart form, field name "file". multer parses it → we strip EXIF → store →
//       insert metadata → return { id, public_url, size }.
// WHY   A route ORCHESTRATES: validate → call collaborators in order → respond. It uses
//       parameterized SQL and never knows which storage driver is active.
// ALTERNATIVES
//   - Presigned/direct upload (scale-up path, ARCHITECTURE §3.3): mint storage.getUploadUrl
//     and let the client PUT bytes straight to R2 so the API never carries them. Not used
//     here because it can't target local disk and needs client-side coordination.
//   - Async EXIF/thumbnailing via a worker (ARCHITECTURE §3.5): we do it inline for
//     simplicity; move it off-request once volume grows.

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import { upload } from "../middleware/multer";
import { storage } from "../services/storage";
import { stripExif } from "../utils/stripExif";
import { generateId } from "../utils/generateId";
import { pool } from "../db/client";
import { HttpError } from "../middleware/errorHandler";
import type { UploadResponse } from "@image-hosting/shared/types/api";

export const uploadRouter = Router();

uploadRouter.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new HttpError(400, "No file uploaded (the form field must be named 'file')");
      }

      const clean = await stripExif(req.file.buffer, req.file.mimetype);

      const id = generateId();
      const ext = path.extname(req.file.originalname) || `.${req.file.mimetype.split("/")[1]}`;
      const storageKey = `${id}${ext}`;

      await storage.uploadFile(clean, storageKey, req.file.mimetype);
      const publicUrl = storage.getPublicUrl(storageKey);

      await pool.query(
        `INSERT INTO images (id, filename, public_url, storage_key, size, mime_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ready')`,
        [id, req.file.originalname, publicUrl, storageKey, clean.length, req.file.mimetype]
      );

      const body: UploadResponse = { id, public_url: publicUrl, size: clean.length };
      res.status(201).json(body);
    } catch (err) {
      next(err); // hand off to the centralized error handler
    }
  }
);
