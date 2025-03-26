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
    
    // Fix Font Awesome dependency for mermaid-isomorphic
    if (isServer) {
      // Using the newer format for externals functions to avoid deprecation warning
      const originalExternals = [...(config.externals || [])];
      config.externals = [
        ({ context, request }: any, callback: any)  => {
          if (request.includes('@fortawesome/fontawesome-free')) {
            return callback();
          }
          
          // Pass the request through the original externals
          if (originalExternals.length === 0) {
            return callback();
          }
          
          let handled = false;
          for (const external of originalExternals) {
            if (typeof external === 'function') {
              external({ context, request }, (err: any, result: any) => {
                if (!handled && !err) {
                  handled = true;
                  callback(null, result);
                }
              });
            }
          }
          
          // If not handled by any of the externals, do not externalize
          if (!handled) {
            callback();
          }
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