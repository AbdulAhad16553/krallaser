import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  reactStrictMode: true,

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // Image configuration (unoptimized for Vercel free plan)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vyixgquehsefmvxpodso.storage.ap-southeast-1.nhost.run",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "backend.shomics.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "erp.krallaser.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack optimizations (splitChunks REMOVED)
  webpack: (config, { dev, isServer }) => {
    return config;
  },

  // Compression
  compress: true,

  async redirects() {
    return [
      {
        source: "/blog/best-cnc-router-pakistan",
        destination: "/blog/best-laser-cutting-machine-pakistan",
        permanent: true,
      },
      {
        source: "/blog/cnc-router-buying-guide",
        destination: "/blog/laser-cutting-machine-buying-guide",
        permanent: true,
      },
      {
        source: "/blog/best-fiber-laser-machine-pakistan",
        destination: "/blog/fiber-laser-vs-co2-laser-pakistan",
        permanent: true,
      },
      {
        source: "/blog/cnc-bits-types",
        destination: "/blog/laser-cutting-machine-parts-guide",
        permanent: true,
      },
      {
        source: "/blog/cnc-laser-cutting-services-pakistan",
        destination: "/blog/metal-laser-cutting-services-pakistan",
        permanent: true,
      },
    ];
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
