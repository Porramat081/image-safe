// shared/index.ts
// Barrel entry for the shared package: re-exports the API contract so consumers can
// `import type { ImageRecord } from "@image-hosting/shared"`.
export * from "./types/api";
