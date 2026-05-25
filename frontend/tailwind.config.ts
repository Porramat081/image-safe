// frontend/tailwind.config.ts
// `content` tells Tailwind which files to scan for class names so it can tree-shake
// unused styles out of the build. If a path is missing here, those classes silently
// won't be generated — a classic "why is my styling gone" gotcha.

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
