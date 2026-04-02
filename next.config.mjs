/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow production builds to complete even with ESLint warnings/errors.
    // ESLint still runs locally via `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
