import "./globals.css";
import type { Metadata } from "next";
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
  // Add viewport metadata for optimization
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

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
        {/* Add preconnect for domains we'll request resources from */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Priority hints for LCP elements */}
        <meta name="priority-hints" content="on" />
        
        {/* Add preload for critical hero images */}
        <link 
          rel="preload" 
          href="/images/hero-bg.webp" 
          as="image" 
          type="image/webp"
          fetchPriority="high"
        />
        
        {/* Improve initial load performance with reduced motion for users who prefer it */}
        <style>
          {`
            @media (prefers-reduced-motion: reduce) {
              *, :after, :before {
                animation-delay: -1ms !important;
                animation-duration: 1ms !important;
                animation-iteration-count: 1 !important;
                background-attachment: initial !important;
                scroll-behavior: auto !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
              }
            }
          `}
        </style>
        
        {/* Critical rendering optimization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // In-line early hint to start font display optimization
              (function() {
                try {
                  const headingElements = ['h1', 'h2', 'h3'];
                  // Mark heading elements with fetchpriority
                  window.addEventListener('DOMContentLoaded', () => {
                    document.querySelectorAll(headingElements.join(',')).forEach(el => {
                      if (el.getBoundingClientRect().top < window.innerHeight) {
                        el.setAttribute('fetchpriority', 'high');
                        el.style.contentVisibility = 'auto';
                      }
                    });
                  });
                } catch(e) {
                  console.error('Priority marking error:', e);
                }
              })();
            `,
          }}
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

