// Frontend/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  typescript: { ignoreBuildErrors: true },

  // Keep your build stable while we’re fixing the hang
  compress: false,
  serverExternalPackages: ["pg"],

  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
      config.cache = false;
      config.parallelism = 1;

      // Progress logs WITHOUT importing webpack package
      config.plugins = config.plugins || [];
      config.plugins.push({
        apply(compiler) {
          const ProgressPlugin = compiler.webpack.ProgressPlugin;
          new ProgressPlugin((p, msg, ...args) => {
            const pct = Math.round(p * 100);
            if (pct % 5 === 0) console.log(`[webpack] ${pct}% ${msg} ${args.join(" ")}`);
          }).apply(compiler);
        },
      });
    }
    return config;
  },
};

export default nextConfig;
