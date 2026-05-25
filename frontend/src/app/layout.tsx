// frontend/src/app/layout.tsx
//
// WHAT  The root layout that wraps every page: <html>/<body>, global CSS, metadata, and
//       shared chrome like the Navbar.
// HOW   App Router renders this once around all routes; put anything that should appear
//       on every page here, and render {children} where the page goes.
// WHY   One shared shell means the nav, fonts, and <head> metadata are defined in a
//       single place instead of repeated per page.
// ALTERNATIVES / NOTE
//   - This is a SERVER component by default (it ships no JS to the browser). Keep it that
//     way: don't add client-only hooks (useState/useEffect) here. Interactive bits belong
//     in small "use client" components (e.g. Navbar menus, UploadZone).
//   - Nested layouts: you can add a layout.tsx inside a route folder to wrap just that
//     section — useful once the app has distinct areas (e.g. an authed dashboard).

import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Image Hosting",
  description: "Upload an image, get a shareable link.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
