/** @type {import('next').NextConfig} */
// Only use Cloudflare assetPrefix when building on Cloudflare Pages.
// Vercel/other previews must load assets from their own domain.
const useCfAssets = process.env.CF_PAGES === '1' || process.env.NEXT_PUBLIC_CF_ASSETS === '1';

const nextConfig = {
  reactStrictMode: true,
  
  // This is the new line! It fetches styles from your trusted pages.dev domain in production
    assetPrefix: useCfAssets ? 'https://frontieratlas.pages.dev' : undefined,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.thum.io",
      },
      {
        protocol: "https",
        hostname: "cdn-thumbnails.huggingface.co",
      },
      {
        protocol: "https",
        hostname: "oyjbeidbifojewvfyarn.supabase.co",
      },
      {
        protocol: "https",
        hostname: "arxiv.org",
      },
      {
        protocol: "https",
        hostname: "pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/benchmark/:slug*',
        destination: '/benchmarks/:slug*',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    const devBackend = "http://127.0.0.1:8787";
    const prodBackend = "https://frontieratlas-backend.morningsignal-india.workers.dev";
    const target = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? devBackend : prodBackend);
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;