// frontend/src/components/ImageGrid.tsx
//
// WHAT  A responsive grid mapping images to <ImageCard>s, with an empty state.
// HOW   <ImageGrid images={images} onDelete={fn} />. Layout-only; data comes from props.
// WHY   Separating "grid layout" (this) from "one card" (ImageCard) from "where data
//       comes from" (the page) keeps each piece single-purpose and composable.
// ALTERNATIVES / SCALE
//   - For very large lists, virtualize (react-window) so the DOM holds only visible rows.

import type { ImageRecord } from "@image-hosting/shared/types/api";
import ImageCard from "./ImageCard";

export default function ImageGrid({
  images,
  onDelete,
}: {
  images: ImageRecord[];
  onDelete?: (id: string) => void;
}) {
  if (images.length === 0) {
    return <p className="py-12 text-center text-gray-400">No images yet — upload one above.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} onDelete={onDelete} />
      ))}
    </div>
  );
}
