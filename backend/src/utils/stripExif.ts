// backend/src/utils/stripExif.ts
//
// WHAT  Removes EXIF metadata (GPS location, camera model, timestamps) from an image by
//       re-encoding it with sharp.
// HOW   const clean = await stripExif(buffer, mimeType); call before storing.
// WHY   Privacy: photos commonly embed the exact GPS coordinates where they were taken;
//       publishing them as-is leaks user location. Re-encoding drops that metadata.
// ALTERNATIVES (where to run this)
//   - Inline in the upload request (what we do): simplest; image is ready immediately, but
//     the user waits for sharp and it competes with request handling under load.
//   - Async worker via a queue (preferred at volume): upload returns instantly with
//     status='processing'; a separate worker strips EXIF + makes thumbnails, then sets
//     status='ready'. Decouples upload latency from processing cost.

import sharp from "sharp";

export async function stripExif(buffer: Buffer, mimeType: string): Promise<Buffer> {
  // sharp reads only the first frame of animated GIFs, which would silently destroy the
  // animation. Leave GIFs untouched; handle them separately if you ever need to.
  if (mimeType === "image/gif") return buffer;

  // .rotate() applies and then drops the EXIF orientation tag; re-encoding via .toBuffer()
  // discards the remaining metadata (GPS, camera, etc.) by default.
  return sharp(buffer).rotate().toBuffer();
}
