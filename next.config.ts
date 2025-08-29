import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    domains: ["www.naturub.com"],
  },
  experimental: {
    viewTransition: true,
  }
};
export default nextConfig;
