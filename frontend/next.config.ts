import type { NextConfig } from "next";

const serverApiUrl = process.env.SERVER_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!serverApiUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${serverApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
