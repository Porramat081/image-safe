// frontend/src/app/page.tsx
//
// WHAT  The home page (route "/"): the upload area plus the grid of uploads.
// HOW   A client component that owns the list state. It loads the first page on mount,
//       reloads after an upload, supports "Load more" via the cursor, and removes a card
//       on delete. Children stay presentational.
// WHY   Pages are composition points — they assemble components and own page-level state,
//       while the components stay small and reusable.
// ALTERNATIVES (a real Next.js choice)
//   - Server Component for the initial fetch (faster first paint + SEO), hydrating a small
//     client island for interactivity. We use the simpler all-client approach here.

"use client";

import { useCallback, useEffect, useState } from "react";
import type { ImageRecord } from "@image-hosting/shared/types/api";
import { listImages, deleteImage } from "@/lib/api";
import UploadZone from "@/components/UploadZone";
import ImageGrid from "@/components/ImageGrid";

export default function HomePage() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { images, next_cursor } = await listImages();
      setImages(images);
      setCursor(next_cursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (!cursor) return;
    try {
      const { images: more, next_cursor } = await listImages(cursor);
      setImages((prev) => [...prev, ...more]);
      setCursor(next_cursor);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <UploadZone onUploaded={loadFirstPage} />

      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <ImageGrid images={images} onDelete={handleDelete} />
      )}

      {cursor && !loading && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Load more
          </button>
        </div>
      )}
    </main>
  );
}
