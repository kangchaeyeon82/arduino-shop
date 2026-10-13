import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 관리자가 업로드한 상품 이미지 (Supabase Storage)
    remotePatterns: [new URL("https://jbwiisbptepkgehryxzf.supabase.co/storage/v1/object/public/**")],
  },
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
