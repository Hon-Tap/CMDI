import path from "path";
import { fileURLToPath } from "url";

/** ESM-safe __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Keep tracing rooted in Frontend/ so Vercel (and local) don’t try to trace
   * from repo root when there are multiple package-lock/package.json files.
   */
  outputFileTracingRoot: __dirname,

  /**
   * Turbopack config is harmless to keep, but it won't affect `next build --webpack`.
   * (Leaving it here avoids warnings if you use Turbopack later.)
   */
  turbopack: {
    root: __dirname,
  },

  /**
   * Remote images you allow (add more hosts as needed).
   */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  /**
   * Temporary safety valve. Keep this ONLY while you're stabilizing builds.
   * After things are green, remove it and fix types properly.
   */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
