import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션 빌드 최적화
  productionBrowserSourceMaps: false, // 소스맵 제거로 원본 코드 보호
  compress: true, // Gzip 압축 활성화

  // 번들 압축 및 최소화
  webpack: (config, { webpack }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };
    return config;
  },

  // 성능 최적화
  swcMinify: true, // SWC를 사용한 최소화 (기본값이지만 명시)
};

export default nextConfig;
