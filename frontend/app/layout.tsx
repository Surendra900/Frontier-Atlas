import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FooterWrapper from "@/components/FooterWrapper";
import CommandPalette from "@/components/CommandPalette";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Frontier Atlas - Discover AI Research",
    template: "%s | Frontier Atlas",
  },
  description:
    "Discover and track the latest breakthroughs in AI and machine learning research. Trending papers, SOTA benchmarks, GitHub stars, and reproducible evaluations.",
  keywords: [
    "AI research",
    "machine learning",
    "research papers",
    "SOTA benchmarks",
    "transformers",
    "large language models",
    "deep learning",
    "AI leaderboards",
    "arXiv",
  ],
  authors: [{ name: "Frontier Atlas Research Team", url: SITE_URL }],
  creator: "Frontier Atlas",
  publisher: "Frontier Atlas",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Frontier Atlas - Discover AI Research",
    description:
      "Discover and track the latest breakthroughs in AI and machine learning research. Trending papers, SOTA benchmarks, GitHub stars, and reproducible evaluations.",
    url: SITE_URL,
    siteName: "Frontier Atlas",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontier Atlas - Discover AI Research",
    description:
      "Discover and track the latest breakthroughs in AI and machine learning research. Trending papers, SOTA benchmarks, and code implementations.",
    creator: "@FrontierAtlas",
    site: "@FrontierAtlas",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ToastProvider>
          {children}
          <FooterWrapper />
          <CommandPalette />
        </ToastProvider>
      </body>
    </html>
  );
}
