/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  // Extra safety: ensures that heavy data fetches don't freeze the build
  staticPageGenerationTimeout: 300, 
  images: {
    remotePatterns: [
      { 
        protocol: "https", 
        hostname: "images.unsplash.com" 
      }
    ],
  },
};

export default nextConfig;