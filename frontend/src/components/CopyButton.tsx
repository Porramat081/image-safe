// frontend/src/components/CopyButton.tsx
//
// WHAT  A click-to-copy button with transient "Copied!" feedback.
// HOW   <CopyButton text={url} />. Self-contained; owns one boolean of state.
// WHY   Must be a CLIENT component: it uses the clipboard API and timer-reset state.
//       Isolating this lets parents (ImageCard, the detail page) stay server components.
// ALTERNATIVES
//   - navigator.clipboard needs a secure context (https/localhost); a legacy fallback
//     would use a hidden input + document.execCommand("copy").

"use client";

import { useState } from "react";
import type { MouseEvent } from "react";

export default function CopyButton({
  text,
  label = "Copy link",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    // Stop the click from bubbling to a parent link/card.
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked (insecure context) — silently ignore */
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
