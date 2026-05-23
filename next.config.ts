import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config so Next.js 16 build doesn't error on missing turbopack config
  turbopack: {},
  // Prevent webpack watcher from scanning large non-source directories
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/wp-content/**",
          "**/public/**",
        ],
        aggregateTimeout: 300,
        poll: false,
      };
    }
    return config;
  },
  images: {
    // Allow featured images served from the old WP uploads CDN during migration
    remotePatterns: [
      {
        protocol: "https",
        hostname: "petralian.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ghchart.rshah.org",
      },
    ],
  },
};

export default nextConfig;
