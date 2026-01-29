/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  typescript: {
    // This allows the build to succeed even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This allows the build to succeed even if there are linting errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
