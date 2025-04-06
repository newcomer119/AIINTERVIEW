import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint:{
    ignoreDuringBuilds:true,
  },
  typeScript:{
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
