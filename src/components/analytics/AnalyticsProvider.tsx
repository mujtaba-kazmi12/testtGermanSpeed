'use client';

import React from 'react';
import GoogleAnalytics from './GoogleAnalytics';
import PageViewTracker from './PageViewTracker'; // Automatic page view tracking

export default function AnalyticsProvider() {
  return (
    <>
      <GoogleAnalytics />
     
      <PageViewTracker />
    </>
  );
} 