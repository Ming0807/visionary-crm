import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for production
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "profile.line-scdn.net",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
  },
  // Compression
  compress: true,
  // Power by header (security)
  poweredByHeader: false,
};

export default nextConfig;
