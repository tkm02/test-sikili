import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/**',
      'node_modules/next/dist/compiled/**',
      'node_modules/webpack/**',
    ],
  },
}

export default nextConfig
