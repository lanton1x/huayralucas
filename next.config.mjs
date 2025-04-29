/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // Set default environment variables here
    // These will be overridden by actual environment variables if they exist
    ENV: 'dev',
    AWS_ROLE_ARN: process.env.AWS_ROLE_ARN || 'dummy-arn',
    AWS_REGION: process.env.AWS_REGION || 'us-west-2',
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'dummy-bucket'
  },
}

export default nextConfig
