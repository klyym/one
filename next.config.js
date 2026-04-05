/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // 在构建时禁用 ESLint 检查，避免警告阻止构建
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
