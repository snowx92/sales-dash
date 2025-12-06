import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  
  images: {
    domains: [
      "vondera-bucket.s3.amazonaws.com",
      "cdn.shopify.com",
      "static-00.iconduck.com",
      "flagcdn.com",
      "ui-avatars.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "vondera-bucket.s3.eu-north-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "vondera-bucket.s3.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "**",
      },
    ],
    minimumCacheTTL: 60,
    deviceSizes: [64, 96, 128, 256, 384, 512, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
  },
  
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Fix for Node.js modules being bundled in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }
    
    return config;
  },

  // async rewrites() {
  //   return dynamicRoutes();
  // },
};

module.exports = nextConfig
