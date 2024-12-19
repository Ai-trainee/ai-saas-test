/** @type {import('next').NextConfig} */
const nextConfig = {
  // 不使用静态导出，保持SSR模式
  //output: 'export',

  // 构建时的优化选项
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 可选：如果想跳过类型检查
  },
  images: { unoptimized: true },

  // 生产环境的优化
  swcMinify: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
