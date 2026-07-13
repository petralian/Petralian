import type { NextConfig } from "next";
import { buildLegacyPostRedirects } from "./src/lib/legacy-redirects";

const nextConfig: NextConfig = {
  // Allow LAN / WSL / Hyper-V IPs to load dev chunks (Next.js 16 blocks cross-origin dev assets by default)
  allowedDevOrigins: [
    "172.24.208.1",
    "192.168.*",
    "10.*",
    "172.*",
  ],
  async redirects() {
    return [
      // WordPress / bookmark paths (GA4 404 top hits)
      { source: "/blog", destination: "/posts", permanent: true },
      { source: "/blog/:slug", destination: "/posts/:slug", permanent: true },
      { source: "/contact", destination: "/about", permanent: true },
      { source: "/services", destination: "/about", permanent: true },
      { source: "/writing", destination: "/posts", permanent: true },
      { source: "/llm.txt", destination: "/llms.txt", permanent: true },
      { source: "/posts/lost-in-space", destination: "/lost-in-space", permanent: true },
      {
        source: "/posts/why-your-ai-program-is-failing-before-it-starts",
        destination: "/posts/why-your-ai-program-may-fail-before-it-starts",
        permanent: true,
      },
      // petralian.com/{slug} → /posts/{slug} for every live post
      ...buildLegacyPostRedirects(),
    ];
  },
  // Serve tinacms admin SPA at /admin (generated into public/admin/index.html by tinacms build)
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
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
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ghchart.rshah.org",
      },
    ],
  },
};

export default nextConfig;
