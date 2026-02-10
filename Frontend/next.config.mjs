import webpack from "next/dist/compiled/webpack/webpack-lib.js";

console.log("[next-config] loaded");

/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  webpack: (config, { dev }) => {
    if (!dev) {
      // Rule out cache weirdness
      config.cache = false;

      // Rule out minifier stalls
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;

      // Progress, but deduped (so it doesn't spam)
      let last = "";
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProgressPlugin((p, msg, ...args) => {
          const pct = Math.round(p * 100);
          const extra = args?.[0] ? ` ${String(args[0])}` : "";
          const line = `[wp ${pct}%] ${msg}${extra}`;
          if (line !== last) {
            last = line;
            console.log(line);
          }
        })
      );
    }
    return config;
  },
};

export default nextConfig;
