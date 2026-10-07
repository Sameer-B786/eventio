/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/idgen',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/signup',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
