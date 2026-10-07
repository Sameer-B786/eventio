/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/idgen',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
