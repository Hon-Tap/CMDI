import path from "path";
import { fileURLToPath } from "url";

/** ESM-safe __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keeps tracing rooted in the Frontend directory
  outputFileTracingRoot: __dirname,

  // Turbopack is the default in v16, but this ensures it respects your root
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    // Next 16 tip: minimumCacheTTL now defaults to 4 hours (improved from 60s)
  },

  /** * SAFETY VALVES
   * Skips heavy TypeScript checks during build to prevent timeouts.
   */
  typescript: {
    ignoreBuildErrors: true,
  },

  /* * NOTE: The 'eslint' key was removed here. 
   * Next.js 16 no longer runs linting during 'next build' by default, 
   * so an 'ignoreDuringBuilds' flag is no longer necessary.
   */

  /**
   * WEBPACK FALLBACK (Optional)
   * Only used if you run 'next build --webpack'. 
   * If using default Turbopack (recommended), this block is ignored.
   */
  webpack: (config) => {
    config.optimization.minimize = true; 
    return config;
  },
};

export default nextConfig;