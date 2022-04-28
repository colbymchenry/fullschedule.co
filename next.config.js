/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.vercel.com', 'res.cloudinary.com']
  },
}

module.exports = nextConfig
