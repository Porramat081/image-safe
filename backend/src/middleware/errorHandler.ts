// backend/src/middleware/errorHandler.ts
//
// WHAT  The one place every error becomes a consistent JSON response (the ApiError shape
//       from the shared package), plus a small HttpError class routes throw for expected
//       failures (404, 400, ...).
// HOW   Register errorHandler LAST in index.ts. Routes throw new HttpError(status, msg)
//       or call next(err); they never format error responses themselves.
// WHY   Centralizing guarantees a uniform error shape and that stack traces never leak.
//       One funnel = one place to add logging/error tracking/status mapping.
// ALTERNATIVES
//   - Format errors in each route: responses drift in shape and internals leak easily.

import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import type { ApiError } from "@image-hosting/shared/types/api";

/** Throw this from a route for an expected, client-facing failure. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

// 4 args is how Express recognizes an error handler — keep all four even if unused.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let status = 500;
  let message = "Internal server error";

  if (err instanceof multer.MulterError) {
    // e.g. the 10 MB limit from middleware/multer.ts
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.message;
  } else if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof Error && err.message === "Only image files are allowed") {
    // the rejection thrown by multer's fileFilter
    status = 400;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log server-side for anything unexpected (send to an error tracker in prod).
  if (status >= 500) console.error(err);

  const body: ApiError = { error: message };
  res.status(status).json(body);
}
