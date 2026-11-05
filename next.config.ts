import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixed only in local/CI performance builds so random framework IDs cannot skew byte comparisons.
  ...(process.env.TAKSH_PERFORMANCE_BUILD_ID ? {
    generateBuildId: async () => process.env.TAKSH_PERFORMANCE_BUILD_ID!,
    deploymentId: process.env.TAKSH_PERFORMANCE_BUILD_ID,
  } : {}),
};

export default nextConfig;
