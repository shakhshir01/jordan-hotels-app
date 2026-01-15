/**
 * Pull-to-refresh hook for mobile devices
 * Provides touch gesture handling and refresh functionality
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    maxPull = 120,
    refreshThreshold = 60,
    minPullDistance = 20, // Minimum distance before preventing default
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (isRefreshing) return;

    // Only start pull-to-refresh tracking if we're at the very top
    if (containerRef.current && containerRef.current.scrollTop > 1) {
      return;
    }

    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsPulling(true);
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const distance = Math.max(0, currentY - startY);

    // Only allow pull-to-refresh when at the very top of the scrollable area
    // Use a very strict check to avoid interfering with normal scrolling
    if (!containerRef.current || containerRef.current.scrollTop > 1) {
      return;
    }

    // Only prevent default behavior after a minimum pull distance
    // This allows normal scrolling to happen first
    if (distance > minPullDistance && distance > 0 && e.cancelable) {
      e.preventDefault();
      const pullAmount = Math.min(distance * 0.5, maxPull);
      setPullDistance(pullAmount);
    }
  }, [isPulling, startY, maxPull, isRefreshing, minPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [isPulling, pullDistance, refreshThreshold, onRefresh, isRefreshing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const refreshIndicator = (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-transform duration-200 ease-out ${
        pullDistance > 0 ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{
        transform: `translateY(${Math.max(-100, pullDistance - 100)}%)`,
      }}
    >
      <div className="flex items-center justify-center py-4">
        <div className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 ${
          pullDistance >= refreshThreshold ? 'text-blue-600 dark:text-blue-400' : ''
        }`}>
          <div className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full transition-transform ${
            isRefreshing ? 'animate-spin' : ''
          }`} />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : pullDistance >= refreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>
    </div>
  );

  return {
    containerRef,
    refreshIndicator,
    isRefreshing,
    pullDistance,
  };
};