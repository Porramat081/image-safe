// backend/src/services/localDisk.ts
//
// WHAT  The local-filesystem implementation of StorageDriver. Development only.
// HOW   Selected by storage.ts when STORAGE_DRIVER=local (the default). Writes files
//       under backend/uploads/; routes/serve.ts streams them back.
// WHY   Lets you run the whole app with zero cloud accounts while learning. The shared
//       interface means prod (R2) behaves the same shape.
// ALTERNATIVES / WARNING
//   - NOT viable in production: the backend is meant to be stateless and horizontally
//     scaled, so a file on one instance won't exist on the others, and PaaS hosts wipe
//     the disk on redeploy. Use R2/S3 in prod.
//   - Local disk has no public host, so getUploadUrl (true presigned PUT) is unsupported
//     here — dev uses the proxied upload path instead.

import { promises as fs } from "fs";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { env } from "../config/env";
import type { StorageDriver } from "./storage";

// uploads/ sits at the backend package root (cwd when running `npm run dev`).
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

/** Absolute path to a stored object — used by serve.ts to stream the file. */
export const localFilePath = (key: string): string => path.join(UPLOADS_DIR, key);

export const localDiskDriver: StorageDriver = {
  async uploadFile(buffer, key) {
    await fs.writeFile(localFilePath(key), buffer);
  },

  // Points back at our own /i/:id route (which streams the file in dev). The key is
  // `<id>.<ext>`, so the id is everything before the first dot.
  getPublicUrl(key) {
    const id = key.split(".")[0];
    return `${env.PUBLIC_BASE_URL}/i/${id}`;
  },

  async deleteFile(key) {
    await fs.rm(localFilePath(key), { force: true });
  },

  async getUploadUrl() {
    throw new Error(
      "Presigned uploads are not supported by the local-disk driver. " +
        "Use the proxied upload path in dev, or set STORAGE_DRIVER=r2."
    );
  },
};
