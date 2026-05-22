import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shiki (used by rehype-pretty-code) runs in Node — keep it out of the client bundle
  serverExternalPackages: ["shiki"],
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
