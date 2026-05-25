// backend/src/middleware/multer.ts
//
// WHAT  Configures how multipart/form-data uploads are parsed when bytes DO pass through
//       the backend (the proxied path / local dev).
// HOW   Use as route middleware: router.post("/", upload.single("file"), handler). The
//       parsed file then lives on req.file as a Buffer.
// WHY   We use memoryStorage so the file arrives as a Buffer ready to hand to sharp or
//       the storage driver, cap the size, and reject non-images at the door before any
//       work happens.
// ALTERNATIVES (this is decision §3.3 in miniature)
//   - Presigned direct upload (preferred at scale): bytes skip the backend entirely, so
//     this middleware isn't on the hot path at all. Keep this for the fallback/dev path.
//   - multer.diskStorage: relieves RAM for huge files but makes the backend stateful.
//   - Stream parsing (busboy) straight to storage: most memory-efficient proxy, more code.
//
// TODO:
//   - import multer from "multer"
//   - storage: multer.memoryStorage()
//   - limits: { fileSize: 10 * 1024 * 1024 }  // 10 MB
//   - fileFilter: accept only image/png, image/jpeg, image/webp, image/gif; else reject
//   - export const upload = multer({ ... });
//   - NOTE: also verify the real type by magic bytes server-side — Content-Type is
//     client-supplied and can lie.
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
