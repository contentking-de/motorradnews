import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/arider-haendler",
        destination: "/motorradhaendler",
        permanent: true,
      },
      {
        source: "/arider-haendler/:slug",
        destination: "/motorradhaendler/:slug",
        permanent: true,
      },
      {
        source: "/motorradhaendler/homeland-custom",
        destination: "/motorradhaendler/homeland-custom-79733",
        permanent: true,
      },
      {
        source: "/messen-events",
        destination: "/termine-events",
        permanent: true,
      },
      {
        source: "/messen-events/:slug",
        destination: "/termine-events/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
