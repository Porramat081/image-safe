// frontend/src/lib/utils.ts
//
// WHAT  Small PURE helpers for display formatting (no I/O, no React).
// HOW   import { formatBytes, getExtension } and call them in components.
// WHY   Pure functions are trivial to test and reuse, and keeping formatting out of JSX
//       keeps components readable.
// ALTERNATIVES
//   - Inline the formatting in JSX: fine once, but duplicated logic drifts and can't be
//     unit-tested in isolation.

/** 1536 -> "1.5 KB", 0 -> "0 B". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  // No decimals for plain bytes; one decimal for KB and up.
  const formatted = exponent === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[exponent]}`;
}

/** "photo.JPG" -> "jpg"; returns "" when there's no extension. */
export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) return "";
  return filename.slice(dot + 1).toLowerCase();
}
