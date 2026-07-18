/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-markdown', 'remark-gfm', 'rehype-highlight', 'rehype-sanitize'],
}

export default nextConfig
