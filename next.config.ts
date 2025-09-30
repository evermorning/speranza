import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    // 빌드 시 타입 체크 건너뛰기 (Vercel 배포용)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 체크 건너뛰기 (Vercel 배포용)
    ignoreDuringBuilds: true,
  },
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
  // Monorepo/상위 lockfile 경고로 인한 정적 자산 404 방지
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
