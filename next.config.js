/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  turbopack: {
    root: __dirname
  },
  transpilePackages: ["@react-pdf/renderer"]
};

module.exports = nextConfig;
