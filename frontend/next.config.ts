import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // allowedDevOrigins: ['localhost', '127.0.0.1'],
  allowedDevOrigins: ['localhost', '127.0.0.1', '172.31.90.79'],
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  compress: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");
    if (!backendUrl) return [];

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;



