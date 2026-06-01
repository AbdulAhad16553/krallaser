import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import CacheInitializer from "@/components/CacheInitializer";
import ChunkErrorRecovery from "@/components/ChunkErrorRecovery";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_URL,
  buildGlobalJsonLd,
  defaultOpenGraph,
} from "@/lib/seo";
// import PWARegister from "@/components/PWARegister";
// import ChatBox from "@/components/ChatBox";

// Plus Jakarta Sans - professional, clean, excellent readability
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Krallaser",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [...DEFAULT_KEYWORDS],
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/krallogo.svg",
    shortcut: "/krallogo.svg",
    apple: "/krallogo.svg",
  },
  openGraph: defaultOpenGraph,
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "shopping",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    return (
      <html lang="en-PK">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#e60001" />
          <meta name="geo.region" content="PK-PB" />
          <meta name="geo.placename" content="Lahore" />
          <link rel="sitemap" type="application/xml" href={`${SITE_URL}/sitemap.xml`} />
          {/* PWA disabled - uncomment these to re-enable installable app */}
          {/* <meta name="theme-color" content="#0368E5" /> */}
          {/* <link rel="manifest" href="/manifest.webmanifest" /> */}
          <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms.txt`} title="LLM guidelines" />
          <link rel="alternate" type="text/plain" href={`${SITE_URL}/ai.txt`} title="AI reference" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildGlobalJsonLd()),
            }}
          />
            <link rel="icon" href="/krallogo.svg" type="image/svg+xml" />
          <link rel="shortcut icon" href="/krallogo.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/krallogo.svg" />
          {/* Preconnect to Google Fonts for faster loading */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <style>
            {`
              :root {
                --primary-color: #e60001;
                --secondary-color: #1a0a0a;
                --primary-gradient: linear-gradient(135deg, #000000 0%, #b00405 50%, #e60001 100%);
                --grey-gradient: linear-gradient(135deg, #000000 0%, #b00405 50%, #e60001 100%);
                --primary-hover: #b00405;
              }
            `}
          </style>
        </head>
        <body className={`${plusJakarta.variable} ${plusJakarta.className}`} cz-shortcut-listen="true">
          <CacheInitializer />
          <ChunkErrorRecovery />
          {/* <PWARegister /> */}
          {children}
          {/* <ChatBox /> */}
        </body>
      </html>
    );
  } catch (error) {
    console.error("Error in layout:", error);
    
    // Fallback layout in case of error
    return (
      <html lang="en">
<head>
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* PWA disabled - uncomment these to re-enable installable app */}
        {/* <meta name="theme-color" content="#0368E5" /> */}
        {/* <link rel="manifest" href="/manifest.webmanifest" /> */}
        <link rel="icon" href="/krallogo.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/krallogo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/krallogo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
        <body className={`${plusJakarta.variable} ${plusJakarta.className}`} cz-shortcut-listen="true">
          <CacheInitializer />
          {/* <PWARegister /> */}
          {children}
          {/* <ChatBox /> */}
        </body>
      </html>
    );
  }
}
