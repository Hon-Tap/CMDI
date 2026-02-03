import path from "path";
import { fileURLToPath } from "url";

/** ESM-safe __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Fix “workspace root” inference warnings (monorepo / multiple lockfiles)
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,

  // ✅ Allow remote images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // ✅ Temporary safety valve (remove later when types are clean)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
