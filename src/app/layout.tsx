import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexsell.com"),
  title: {
    default: "NexSell — Autonomous AI Commerce Gateway",
    template: "%s | NexSell",
  },
  description:
    "The world's first platform where humans, companies, and AI agents transact autonomously. Discover, negotiate, purchase, and manage everything — without requiring a human in the loop.",
  keywords: [
    "AI commerce",
    "autonomous transactions",
    "AI marketplace",
    "agent commerce",
    "AI agents",
    "MCP",
    "API marketplace",
    "autonomous purchasing",
  ],
  authors: [{ name: "NexSell" }],
  creator: "NexSell",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexsell.com",
    siteName: "NexSell",
    title: "NexSell — Autonomous AI Commerce Gateway",
    description:
      "The world's first platform where humans, companies, and AI agents transact autonomously.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NexSell — Autonomous AI Commerce Gateway",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexSell — Autonomous AI Commerce Gateway",
    description:
      "The world's first platform where humans, companies, and AI agents transact autonomously.",
    images: ["/og-image.png"],
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
  alternates: {
    canonical: "https://nexsell.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* JSON-LD for AI discoverability */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "NexSell",
              description:
                "Autonomous AI commerce gateway where humans, companies, and AI agents transact directly",
              url: "https://nexsell.com",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Cloud",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free to start, pay as you grow",
              },
              "nexsell:protocols": {
                mcp: "https://mcp.nexsell.com/sse",
                openapi: "https://api.nexsell.com/v1",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-neutral-0 antialiased">
        {children}
      </body>
    </html>
  );
}
