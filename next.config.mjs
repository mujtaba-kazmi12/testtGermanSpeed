import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        try {
          if (entries['main.js']) {
            const preloadFontsPath = path.join(__dirname, './client/preload-fonts.js');
            const performanceMonitorPath = path.join(__dirname, './client/performance-monitor.js');
            
            if (!entries['main.js'].includes(preloadFontsPath)) {
              entries['main.js'].unshift(preloadFontsPath);
            }
            
            if (!entries['main.js'].includes(performanceMonitorPath)) {
              entries['main.js'].push(performanceMonitorPath);
            }
          }
        } catch (e) {
          console.error('Error in webpack entry modification:', e);
        }
        
        return entries;
      };
    }
    
    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  }
};

export default withNextIntl(nextConfig); 