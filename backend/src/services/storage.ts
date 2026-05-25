// backend/src/services/storage.ts
//
// WHAT  The storage abstraction — an interface (StorageDriver) plus the single `storage`
//       instance the rest of the backend uses. The most important seam in the codebase.
// HOW   Routes import { storage } and call its methods; they never import r2.ts or
//       localDisk.ts directly. Add a provider by implementing StorageDriver and wiring
//       it into the selector below.
// WHY   Dependency inversion: routes depend on the INTERFACE, not on a vendor. Dev runs
//       on local disk (zero cloud setup), prod on R2/S3, and route code is identical.
// ALTERNATIVES
//   - Call the S3 SDK straight from routes: fewer files, but routes weld to one vendor.
//   - Full hexagonal/ports-and-adapters: same idea with more ceremony; overkill here.

import { env } from "../config/env";
import { localDiskDriver } from "./localDisk";
import { r2Driver } from "./r2";

export interface StorageDriver {
  /** Store bytes under `key` (proxied path / local dev). */
  uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<void>;
  /** The readable URL for an object (a CDN/public URL in prod). */
  getPublicUrl(key: string): string;
  /** Remove the object. */
  deleteFile(key: string): Promise<void>;
  /** Short-lived URL the client can PUT bytes to directly (scale-up path; R2 only). */
  getUploadUrl(key: string, mimeType: string): Promise<string>;
}

// Selected once at startup from STORAGE_DRIVER. The rest of the app just imports `storage`.
export const storage: StorageDriver =
  env.STORAGE_DRIVER === "r2" ? r2Driver : localDiskDriver;
