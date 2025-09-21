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
  serverExternalPackages: ['googleapis'],
  output: 'standalone',
  experimental: {
    // Hydration mismatch 문제 해결을 위한 설정
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
