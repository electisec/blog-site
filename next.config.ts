import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: [
    "@ant-design/icons-svg",
    "@ant-design/icons",
    "rc-util",
    "rc-pagination",
    "rc-picker",
  ],
  webpack: (config) => {
    // Handle ES modules correctly
    config.module.rules.push({
      test: /\.(js|mjs|jsx)$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
  async redirects() {
    return [
      {
        source: '/blogs/:year(\\d{4})-:month(\\d{2})-:day(\\d{2})-:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;