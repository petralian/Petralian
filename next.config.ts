import type { NextConfig } from "next";
import {
  buildLegacyPostRedirects,
  buildWordPressLegacyRedirects,
} from "./src/lib/legacy-redirects";

const nextConfig: NextConfig = {
  // VPS deploy builds to NEXT_DIST_DIR (.next-staging) then atomically swaps — live .next stays intact.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Allow LAN / WSL / Hyper-V IPs to load dev chunks (Next.js 16 blocks cross-origin dev assets by default)
  allowedDevOrigins: [
    "172.24.208.1",
    "192.168.*",
    "10.*",
    "172.*",
  ],
  async redirects() {
    return [
      // WordPress legacy paths (301 → closest live page; before root-slug post redirects)
      ...buildWordPressLegacyRedirects(),
      // WordPress / bookmark paths (GA4 404 top hits)
      { source: "/blog", destination: "/posts", permanent: true },
      { source: "/blog/:slug", destination: "/posts/:slug", permanent: true },
      { source: "/blog/:slug/", destination: "/posts/:slug", permanent: true },
      { source: "/contact", destination: "/about", permanent: true },
      { source: "/services", destination: "/about", permanent: true },
      { source: "/writing", destination: "/posts", permanent: true },
      { source: "/llm.txt", destination: "/llms.txt", permanent: true },
      { source: "/ai.txt", destination: "/llms.txt", permanent: true },
      { source: "/posts/lost-in-space", destination: "/lost-in-space", permanent: true },
      {
        source: "/posts/why-your-ai-program-is-failing-before-it-starts",
        destination: "/posts/why-your-ai-program-may-fail-before-it-starts",
        permanent: true,
      },
      {
        source: "/posts/cursorbench-fable-5-composer-2-5-cost-vs-score",
        destination: "/posts/cursorbench-3-2-fable-5-composer-2-5-cost-vs-score",
        permanent: true,
      },
      {
        source: "/posts/cursor-local-proxy-cloudflare-tunnel-windows",
        destination: "/posts/cursor-token-saving-tools-beyond-headroom-2026",
        permanent: false,
      },
      {
        source: "/posts/cursor-stack-cherry-picking-honey-superpowers-headroom-2026",
        destination: "/posts/cursor-token-saving-tools-beyond-headroom-2026",
        permanent: false,
      },
      // GSC 404 / legacy slug fixes (2026-07-28 drilldown + live probe)
      { source: "/privacy-policy", destination: "/about", permanent: true },
      { source: "/privacy-policy/", destination: "/about", permanent: true },
      {
        source: "/how-ai-and-human-imagination-work-together-to-break-barriers",
        destination: "/posts/how-ai-and-human-imagination-work-together",
        permanent: true,
      },
      {
        source: "/how-ai-and-human-imagination-work-together-to-break-barriers/",
        destination: "/posts/how-ai-and-human-imagination-work-together",
        permanent: true,
      },
      {
        source: "/posts/delivery-leadership",
        destination: "/posts/knowledge-work-engine-leadership-decisions-2026",
        permanent: true,
      },
      {
        source: "/posts/what-the-next-generation-of-delivery-leadership-may-look-like",
        destination: "/posts/knowledge-work-engine-leadership-decisions-2026",
        permanent: true,
      },
      {
        source: "/new-merkle-md/page/:path*",
        destination: "/posts/new-merkle-md",
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
    // Heroes/body images pre-compressed at sync (raster-to-avif.mjs + data/image-pipeline.yaml).
    // Disables Vercel Image Optimization transforms (Hobby 5k/mo cap).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ghchart.rshah.org",
      },
    ],
  },
};

export default nextConfig;
