"use client";

import { useEffect } from 'react';
import { cacheUtils } from '@/lib/clientCache';

let cacheInitialized = false;

export function CacheInitializer() {
  useEffect(() => {
    // Only run cache cleanup once globally to avoid clearing cache during navigation
    if (!cacheInitialized) {
      try {
        console.log('🧹 Initializing global cache cleanup (one-time only)');
        cacheUtils.cleanupAll();
        cacheInitialized = true;
      } catch (error) {
        console.warn('Error during global cache initialization:', error);
      }
    }
  }, []);

  return null; // This component doesn't render anything
}

export default CacheInitializer;
