// frontend/src/components/UploadZone.tsx
//
// WHAT  The drag-and-drop (and click-to-select) upload area.
// HOW   <UploadZone onUploaded={() => reloadList()} />. Owns local UI state (dragging /
//       uploading / progress / error) and reports success up via the callback. It does
//       NOT talk to the network directly — it calls uploadImage() from lib/api.
// WHY   Must be a CLIENT component: uploading needs browser APIs (drag events, file input)
//       and interactive state (a progress bar). Reporting the result up keeps it reusable.
// ALTERNATIVES
//   - Presigned direct upload at scale (ARCHITECTURE §3.3): lib/api would hand back a
//     presigned URL and this component would PUT bytes straight to storage.

"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { uploadImage } from "@/lib/api";

export default function UploadZone({ onUploaded }: { onUploaded?: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      await uploadImage(file, setProgress);
      onUploaded?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = ""; // allow re-selecting the same file
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      {uploading ? (
        <p className="text-gray-600">Uploading… {progress}%</p>
      ) : (
        <p className="text-gray-500">Drag &amp; drop an image here, or click to choose</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
