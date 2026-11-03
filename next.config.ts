import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Lets a project's cover glide from its card to the project page (React <ViewTransition>)
    viewTransition: true,
  },
};

export default nextConfig;
