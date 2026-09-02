import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // allowedDevOrigins: ['localhost', '127.0.0.1'],
  allowedDevOrigins: ['localhost', '127.0.0.1', '172.31.90.79'],
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  compress: true,
};

export default nextConfig;



