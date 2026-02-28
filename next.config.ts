import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/card", destination: "/", permanent: false },
  ],
};

export default nextConfig;
