import type { NextConfig } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const apiUrl = new URL(apiBase);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", ""),
        hostname: apiUrl.hostname,
        port: apiUrl.port || "",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
