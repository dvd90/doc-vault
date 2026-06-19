/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
  },
  async rewrites() {
    // Proxy client-side API calls through Next.js so the browser never makes
    // a cross-origin request. Same-origin means the web-domain cookie is
    // forwarded automatically — no cross-site cookie issues.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    return [{ source: '/api-proxy/:path*', destination: `${apiUrl}/:path*` }]
  },
}

export default nextConfig
