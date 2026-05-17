import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    // Native addon — only used locally, excluded from Vercel bundle
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
  ],
};

export default nextConfig;
