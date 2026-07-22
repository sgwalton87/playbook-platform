import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/onboarding",
        destination: "/start",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
