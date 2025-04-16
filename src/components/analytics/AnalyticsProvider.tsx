'use client';

import React from 'react';
import GoogleAnalytics from './GoogleAnalytics';
// import GoogleTagManager from './GoogleTagManager'; // Removed GTM
// import PageViewTracker from './PageViewTracker'; // Automatic page view tracking previously removed

export default function AnalyticsProvider() {
  return (
    <>
      <GoogleAnalytics />
      {/* <GoogleTagManager /> // Removed GTM */}
      {/* <PageViewTracker /> // Automatic page view tracking previously removed */}
    </>
  );
} 