import React, { useEffect, useState } from 'react';

// Performance monitoring component for development
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        setMetrics({
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
          timestamp: Date.now()
        });
      }
    };

    // Measure after initial load
    if (document.readyState === 'complete') {
      setTimeout(measurePerformance, 100);
    } else {
      window.addEventListener('load', () => setTimeout(measurePerformance, 100));
    }

    // Update metrics every 5 seconds
    const interval = setInterval(measurePerformance, 5000);
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !metrics) return null;

  return (
    <div className="fixed bottom-2 left-2 bg-black/80 text-white text-xs p-2 rounded font-mono z-[9999] max-w-xs">
      <div className="font-bold mb-1">Performance</div>
      {metrics.domContentLoaded && (
        <div>DCL: {Math.round(metrics.domContentLoaded)}ms</div>
      )}
      {metrics.loadComplete && (
        <div>Load: {Math.round(metrics.loadComplete)}ms</div>
      )}
      {metrics.firstPaint && (
        <div>FP: {Math.round(metrics.firstPaint)}ms</div>
      )}
      {metrics.firstContentfulPaint && (
        <div>FCP: {Math.round(metrics.firstContentfulPaint)}ms</div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
