// frontend/next.config.mjs
// Next.js config. (Next 14 loads .js/.mjs config, not .ts.) The key setting is
// `images.remotePatterns`: next/image refuses to optimize images from hosts you haven't
// whitelisted, so add your R2 public domain (and localhost for dev) here.

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_URL || "pub-xxxx.r2.dev",
      },
      // TODO: add your R2 public host, e.g.
      // { protocol: "https", hostname: "pub-xxxx.r2.dev" },
    ],
  },
};

export default nextConfig;
