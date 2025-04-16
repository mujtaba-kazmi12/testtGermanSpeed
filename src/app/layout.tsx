import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import clsx from "clsx";

// Optimize font loading for better LCP
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Use font-display: swap
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});


export const metadata: Metadata = {
  title: "GermanGuestPost - Content Marketplace",
  description: "Find and buy high-quality content services for your website",
  
 
};


export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload important assets for the hero section */}
        <link 
          rel="preload" 
          href="/fonts/inter-var.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
        {/* Preload critical CSS */}
        <link 
          rel="preload" 
          href="/styles/critical.css"
          as="style"
        />
      </head>
      <body className={clsx(inter.className, "min-h-screen bg-background antialiased")}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
