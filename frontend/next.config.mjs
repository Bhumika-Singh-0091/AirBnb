/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Proxy API + uploaded images to FastAPI so the browser stays same-origin
  // (httpOnly auth cookie "just works", no CORS headaches).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
