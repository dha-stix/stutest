import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All app data comes from Firebase on the client, so pages render client-side;
  // Cache Components would add Suspense requirements without any benefit here.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
