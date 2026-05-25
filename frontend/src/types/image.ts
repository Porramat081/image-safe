// frontend/src/types/image.ts
//
// WHAT  The image type used by the UI. It re-exports the canonical ImageRecord from the
//       shared package rather than declaring its own.
// HOW   import type { ImageRecord } from "@/types/image". Add a separate view-model type
//       here ONLY if the UI needs derived fields the API doesn't send.
// WHY   The contract must live in one place (the shared package). Re-exporting keeps a
//       convenient local import path without creating a second definition that could
//       drift from the backend's.
// ALTERNATIVES
//   - Redeclare the interface here: handy short-term, but now two definitions can
//     disagree and the compiler won't catch it.

export type { ImageRecord } from "@image-hosting/shared/types/api";

// Example view-model that ADDS a derived field the API doesn't send:
// import type { ImageRecord } from "@image-hosting/shared/types/api";
// export interface ImageView extends ImageRecord { humanSize: string }
