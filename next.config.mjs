/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Adicione esta configuração para API routes
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Aumenta o limite para 50MB
    },
  },
}

export default nextConfig 