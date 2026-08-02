import type { NextConfig } from "next";
import { APPLICATION_SECURITY_HEADERS } from "./lib/security/headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/onboarding",
        destination: "/start",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...APPLICATION_SECURITY_HEADERS],
      },
    ];
  },
};

export default nextConfig;
