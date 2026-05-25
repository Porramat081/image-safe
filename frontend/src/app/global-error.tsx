// frontend/src/app/global-error.tsx
//
// WHAT  The last-resort error boundary. Catches errors thrown in the ROOT layout itself
//       (layout.tsx / its server-rendered children) — the one place error.tsx cannot reach.
// HOW   App Router renders this INSTEAD of the root layout when the root throws, so it must
//       supply its own <html> and <body>. Like error.tsx it's a client component and gets
//       the thrown `error` (with `digest` in prod) plus `reset()`.
// WHY   A crash in the root layout would otherwise yield a totally blank page with no UI to
//       read. This guarantees the `digest` is always visible, whatever fails.
// ALTERNATIVES
//   - Omit it: fine while the layout is trivial, but then a layout-level throw shows nothing
//     at all. Cheap insurance to keep it.

"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-2xl space-y-4 p-6">
          <h1 className="text-lg font-semibold text-red-600">
            Application error
          </h1>
          <p className="text-sm text-gray-600">
            A root-level error occurred. The message is hidden in production — match the
            digest below against the frontend service&apos;s runtime logs.
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
      </body>
    </html>
  );
}
