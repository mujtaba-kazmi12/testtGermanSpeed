'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { ANALYTICS_CONFIG } from '@/lib/analytics-config';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function GoogleTagManager() {
  const { GTM_ID } = ANALYTICS_CONFIG;

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
  }, []);

  if (!GTM_ID) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      {/* Google Tag Manager - NoScript (for browsers with JavaScript disabled) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
} 