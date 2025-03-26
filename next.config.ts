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
    "mermaid-isomorphic",
    "@fortawesome/fontawesome-free"
  ],
  webpack: (config, { isServer }) => {
    // Handle ES modules correctly
    config.module.rules.push({
      test: /\.(js|mjs|jsx)$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    // Force webpack to bundle @fortawesome/fontawesome-free instead of treating it as external
    if (isServer) {
      const originalExternals = config.externals;
      config.externals = [
        (context: any, request: string | string[], callback: () => any) => {
          // Do not externalize @fortawesome/fontawesome-free
          if (request.includes('@fortawesome/fontawesome-free')) {
            return callback();
          }
          // For all other externals, maintain the original behavior
          if (typeof originalExternals === 'function') {
            return originalExternals(context, request, callback);
          } else if (Array.isArray(originalExternals)) {
            for (const external of originalExternals) {
              if (typeof external === 'function') {
                const result = external(context, request, callback);
                if (result !== undefined) return result;
              }
            }
          }
          return callback();
        }
      ];
    }
    
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