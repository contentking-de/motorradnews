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
    ];
  },
};

export default nextConfig;
