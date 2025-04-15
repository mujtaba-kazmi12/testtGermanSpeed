// Performance monitoring script
(() => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Track LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lcpEntry = entries[entries.length - 1];
        
        console.log('LCP:', lcpEntry.startTime, 'ms');
        console.log('LCP Element:', lcpEntry.element);
        
        // Report to analytics if needed
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'web_vitals',
            metric_name: 'LCP',
            metric_value: Math.round(lcpEntry.startTime),
            metric_delta: 0,
          });
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.error('LCP Observer error:', e);
    }
    
    // Track FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fidEntry = entries[0];
        
        console.log('FID:', fidEntry.processingStart - fidEntry.startTime, 'ms');
        
        // Report to analytics if needed
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'web_vitals',
            metric_name: 'FID',
            metric_value: Math.round(fidEntry.processingStart - fidEntry.startTime),
            metric_delta: 0,
          });
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.error('FID Observer error:', e);
    }
    
    // Track CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      let clsEntries = [];
      
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
        
        console.log('Current CLS:', clsValue);
        
        // Report to analytics if needed (throttled)
        if (window.dataLayer && clsValue > 0.1) {
          window.dataLayer.push({
            event: 'web_vitals',
            metric_name: 'CLS',
            metric_value: clsValue.toFixed(3),
            metric_delta: 0,
          });
        }
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('CLS Observer error:', e);
    }
    
    // Add debugger info to console
    console.info('🚀 Performance monitoring initialized');
  }
})(); 