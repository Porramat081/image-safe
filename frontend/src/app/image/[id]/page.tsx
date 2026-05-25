// frontend/src/app/image/[id]/page.tsx
//
// WHAT  The public detail page for one image (route "/image/:id") — the page you share.
// HOW   The [id] folder makes a dynamic route; the segment arrives as params.id. We build
//       the stable public link (the backend's /i/:id) and render the image + a copy button.
// WHY   A dedicated, linkable page per image is what makes sharing work: it can be
//       bookmarked, previewed by social cards, and indexed.
// NOTE  This scaffold has no GET /images/:id metadata endpoint, so we show the image via
//       its stable /i/:id link rather than its filename/size. Add such an endpoint if you
//       want to display metadata here.
// ALTERNATIVES (Next.js rendering strategies — relevant to "serve quickly")
//   - ISR / generateStaticParams: pre-render popular images as cached static pages.
//   - generateMetadata(): emit per-image OpenGraph tags so shared links preview nicely.

import Link from "next/link";
import CopyButton from "@/components/CopyButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ImageDetailPage({ params }: { params: { id: string } }) {
  const shareUrl = `${API_URL}/i/${params.id}`;

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back to all images
      </Link>

      <img src={shareUrl} alt={`Image ${params.id}`} className="w-full rounded border" />

      <div className="flex items-center gap-3">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 rounded border px-3 py-2 text-sm"
          onFocus={(e) => e.currentTarget.select()}
        />
        <CopyButton text={shareUrl} />
      </div>
    </main>
  );
}
