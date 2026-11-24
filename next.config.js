/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  ...(isGhPages
    ? {
        output: 'export',
        basePath: '/perfumeria-sr',
        assetPrefix: '/perfumeria-sr',
        trailingSlash: true,
        env: {
          NEXT_PUBLIC_BASE_PATH: '/perfumeria-sr',
          NEXT_PUBLIC_STATIC_EXPORT: 'true',
        },
      }
    : {
        outputFileTracingIncludes: {
          '/api/fragrances': ['./src/data/parfumo-catalog.json'],
        },
      }),
  images: {
    unoptimized: isGhPages,
    remotePatterns: [],
  },
  transpilePackages: ['three'],
};

module.exports = nextConfig;
