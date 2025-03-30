/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Disable source maps in development
    if (dev) {
      config.devtool = 'eval';
    }
    return config;
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 