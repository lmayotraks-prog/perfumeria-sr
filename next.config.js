/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  transpilePackages: ['three'],
  outputFileTracingIncludes: {
    '/api/fragrances': ['./src/data/parfumo-catalog.json'],
  },
};

module.exports = nextConfig;
