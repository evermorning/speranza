import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        'https-proxy-agent': false,
        'http-proxy-agent': false,
        'socks-proxy-agent': false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['googleapis'],
  },
};

export default nextConfig;
