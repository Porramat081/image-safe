// frontend/src/app/error.tsx
//
// WHAT  The route-level error boundary. Next.js renders this client component whenever a
//       page/segment under app/ throws during render (server OR client).
// HOW   App Router auto-wires any error.tsx to the segment it sits in (here: the root, so
//       it covers every page). It receives the thrown `error` and a `reset()` to retry.
// WHY   In production Next.js REDACTS server-thrown error messages and exposes only
//       `error.digest` — a hash that matches a full message+stack in the server logs.
//       Showing that digest here turns a blank masked console error into a one-step
//       lookup ("find this digest in the Railway frontend logs").
// ALTERNATIVES
//   - Let the default Next error UI show: it hides the digest from the user, so you'd have
//     to dig through logs blind. Surfacing the digest is the cheap win.

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Also log to the browser console for quick copy/paste.
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-lg font-semibold text-red-600">Something went wrong</h1>
      <p className="text-sm text-gray-600">
        In production the underlying message is hidden. Match the digest below against the
        frontend service&apos;s runtime logs to find the real error and stack trace.
      </p>
      {error.digest && (
        <p className="rounded border bg-gray-50 px-3 py-2 font-mono text-sm">
          digest: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Try again
      </button>
    </main>
  );
}
