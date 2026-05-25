// frontend/src/components/ImageCard.tsx
//
// WHAT  A card for one image: thumbnail (links to the detail page), filename, size, a
//       copy-link button, and an optional delete button.
// HOW   <ImageCard image={record} onDelete={fn} />. Reads data from props; the delete
//       action is delegated UP via the onDelete callback (the page owns the mutation).
// WHY   Mostly presentational — no data fetching, no list state. Delegating delete keeps
//       it reusable and keeps "what happens on delete" in one place (the page).
// ALTERNATIVES / PERFORMANCE
//   - Show a THUMBNAIL variant, not the full original, once you generate them
//     (ARCHITECTURE §3.5). We use a plain <img> instead of next/image to avoid remote-host
//     config friction in this scaffold; switch to next/image for automatic resizing.

import Link from "next/link";
import type { ImageRecord } from "@image-hosting/shared/types/api";
import CopyButton from "./CopyButton";
import { formatBytes } from "@/lib/utils";

export default function ImageCard({
  image,
  onDelete,
}: {
  image: ImageRecord;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded border">
      <Link href={`/image/${image.id}`} className="block aspect-square bg-gray-100">
        <img
          src={image.public_url}
          alt={image.filename}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex flex-col gap-2 p-2 text-sm">
        <span className="truncate font-medium" title={image.filename}>
          {image.filename}
        </span>
        <span className="text-gray-500">{formatBytes(image.size)}</span>
        <div className="flex items-center gap-2">
          <CopyButton text={image.public_url} />
          {onDelete && (
            <button
              onClick={() => onDelete(image.id)}
              className="rounded border px-2 py-1 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
