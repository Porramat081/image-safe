// shared/types/api.ts
//
// WHAT  The API contract: the exact request/response shapes the backend produces and
//       the frontend consumes. This package (@image-hosting/shared) is the single
//       source of truth both sides import.
// HOW   Backend: shape responses as these types (`res.json(x satisfies UploadResponse)`).
//       Frontend: type fetch results with them in lib/api.ts. Never redefine these
//       shapes locally — import them.
// WHY   When you change a field here, TypeScript flags every mismatched usage on BOTH
//       sides at compile time. The contract cannot silently drift into a runtime bug.
// ALTERNATIVES
//   - Duplicate the types in each app: simplest, but the copies drift and the failure
//     surfaces as a broken screen in prod instead of a compile error.
//   - Generate from an OpenAPI/JSON schema: most robust for many clients/languages, but
//     heavier tooling than a two-app project needs.

/** One row of the `images` table, as sent to the client. */
export interface ImageRecord {
  id: string;            // nanoid, also the slug in the public URL
  filename: string;      // original filename from the upload
  public_url: string;    // full URL the client can <img src> directly (CDN url in prod)
  size: number;          // bytes
  mime_type: string;     // e.g. "image/jpeg"
  status: "pending" | "processing" | "ready"; // async pipeline state (see ARCHITECTURE §3.5)
  uploaded_at: string;   // ISO 8601 timestamp
}

/** Step 1 of a direct upload: client tells the backend what it wants to upload. */
export interface CreateUploadRequest {
  filename: string;
  mime_type: string;
  size: number;
}

/** Step 1 response: a presigned URL to PUT bytes straight to storage (see ARCHITECTURE §3.3). */
export interface CreateUploadResponse {
  id: string;
  upload_url: string;    // presigned PUT URL; client uploads bytes here, not to the API
  public_url: string;    // where the image will be readable once uploaded
}

/** Response of the simple proxied upload (the non-presigned fallback path). */
export interface UploadResponse {
  id: string;
  public_url: string;
  size: number;
}

/** Response of GET /images. Uses a cursor for keyset pagination (see ARCHITECTURE §3.6). */
export interface ImageListResponse {
  images: ImageRecord[];
  next_cursor: string | null; // pass back as ?cursor= to fetch the next page; null = end
}

/** Shape every error response shares (see backend errorHandler). */
export interface ApiError {
  error: string;
  details?: unknown;
}
