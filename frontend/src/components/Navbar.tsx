// frontend/src/components/Navbar.tsx
//
// WHAT  The top navigation bar: logo/title linking home, with room for auth links later.
// HOW   Rendered once in layout.tsx so it appears on every page.
// WHY   Shared chrome belongs in one component rendered by the layout, not copy-pasted
//       into each page. It can stay a SERVER component since it's static — add
//       "use client" only if you introduce an interactive menu.
// ALTERNATIVES
//   - Put the markup directly in layout.tsx: fine while it's trivial, but a component
//     keeps the layout readable and the nav independently testable as it grows.
//
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b px-6 py-4">
      <Link href="/" className="font-semibold">
        🖼️ Image Hosting
      </Link>
    </nav>
  );
}
