// backend/src/middleware/cors.ts
//
// WHAT  The Cross-Origin Resource Sharing policy: which web origins may call this API
//       from a browser.
// HOW   app.use(corsMiddleware) early in index.ts. Set the allowed origin to the
//       frontend's real URL per environment (localhost:3000 in dev, your domain in prod).
// WHY   Browsers block cross-origin requests unless the server opts in. Your frontend and
//       backend are on different origins, so without this every fetch fails. Allow only
//       your frontend origin — not "*" — so arbitrary sites can't drive your API.
// ALTERNATIVES
//   - origin "*": convenient, but lets any website call your API and is incompatible with
//     credentialed requests. Avoid for anything non-public.
//   - Same-origin via a reverse proxy (serve frontend + API under one domain): removes the
//     need for CORS entirely; a deployment-topology choice rather than a code one.
//
// TODO:
//   - import cors from "cors"
//   - export const corsMiddleware = cors({ origin: <frontend origin from env>, methods: ["GET","POST","DELETE"] })

import cors from "cors";
export const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "DELETE"],
});
