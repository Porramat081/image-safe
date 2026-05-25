// frontend/src/lib/api.ts
//
// WHAT  Typed wrappers around every backend call — the ONLY module that knows backend
//       URLs and response shapes.
// HOW   Components import { uploadImage, listImages, deleteImage }; they never call
//       fetch() themselves. Types come from the shared contract, so a contract change
//       errors right here.
// WHY   Centralizing networking keeps URLs, headers, and error handling in one place; a
//       URL or auth change is a one-file edit and components stay free of plumbing.
// ALTERNATIVES
//   - Inline fetch() in components: URLs/handling get copy-pasted and drift.
//   - TanStack Query / SWR: adds caching, retries, loading state — would wrap THESE
//     functions, not replace them. A natural next step.

import type {
  UploadResponse,
  ImageListResponse,
} from "@image-hosting/shared/types/api";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/** Parse a JSON response, turning non-2xx into a thrown Error carrying the API message. */
async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

/**
 * Upload one image via the proxied endpoint. Uses XMLHttpRequest (not fetch) so we can
 * report real upload progress — fetch can't observe request-body progress.
 */
export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as UploadResponse);
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body?.error) message = body.error;
        } catch {
          /* no JSON body */
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

/** Fetch one page of images. Pass a previous response's next_cursor to get the next page. */
export async function listImages(cursor?: string | null): Promise<ImageListResponse> {
  const url = new URL(`${BASE}/images`);
  if (cursor) url.searchParams.set("cursor", cursor);
  return jsonOrThrow<ImageListResponse>(await fetch(url.toString()));
}

/** Delete an image (storage + metadata). */
export async function deleteImage(id: string): Promise<void> {
  const res = await fetch(`${BASE}/images/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    await jsonOrThrow(res); // throws with the API's error message
  }
}
