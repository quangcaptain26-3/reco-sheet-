import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  /* config options here */
  output: isStaticExport ? "export" : "standalone",
  cacheComponents: !isStaticExport,
  partialPrefetching: !isStaticExport,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
