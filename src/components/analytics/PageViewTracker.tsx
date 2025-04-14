'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';

// Component that uses useSearchParams
function PageViewTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track page view when route changes
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    console.log(`Page view tracked: ${url}`);
    trackPageView(url);
  }, [pathname, searchParams, trackPageView]);

  // This component doesn't render anything
  return null;
}

// Wrapped with Suspense to prevent hydration errors
export default function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerContent />
    </Suspense>
  );
} 