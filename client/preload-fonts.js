// This file executes immediately when your application loads
// Preload critical fonts to improve LCP
(() => {
  if (typeof window !== 'undefined') {
    // Helper to create and append link elements for preloading
    const preloadFont = (href) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = href;
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    };

    // Pre-establish connection to static assets domain
    const preconnect = (url) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    };

    // Preconnect to domains
    preconnect('https://fonts.googleapis.com');
    preconnect('https://fonts.gstatic.com');

    // Preload critical fonts
    preloadFont('/fonts/inter-var.woff2');

    // Add dns-prefetch for third-party resources
    const dnsPrefetch = (url) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      document.head.appendChild(link);
    };

    // Add DNS prefetch for all third-party resources
    dnsPrefetch('https://fonts.googleapis.com');
    dnsPrefetch('https://fonts.gstatic.com');
  }
})(); 