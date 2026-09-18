/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  
  // This is the new line! It fetches styles from your trusted pages.dev domain in production
  assetPrefix: isProd ? 'https://frontieratlas.pages.dev' : undefined,

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
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://frontieratlas-backend.morningsignal-india.workers.dev"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;