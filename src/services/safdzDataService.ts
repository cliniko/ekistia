/**
 * SAFDZ Data Service - Pre-loads and caches SAFDZ GeoJSON data
 * This service starts loading data immediately when imported, ensuring
 * it's available when components mount.
 * 
 * Debug mode: Set VITE_DEBUG_LOADING=true to see detailed logs
 */

// Debug flag - enable detailed logging
const DEBUG = import.meta.env.VITE_DEBUG_LOADING === 'true';

// Global cache and promise for SAFDZ data
let safdzDataCache: any = null;
let safdzDataPromise: Promise<any> | null = null;
let isLoading = false;

/**
 * Initialize SAFDZ data loading immediately
 * This runs when the module is first imported
 */
function initializeSafdzData() {
  if (!safdzDataPromise && !isLoading) {
    isLoading = true;
    
    const startTime = DEBUG ? performance.now() : 0;

    safdzDataPromise = fetch('/safdz_agri_barangays.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data || !data.features || !Array.isArray(data.features)) {
          throw new Error('Invalid SAFDZ data format');
        }

        safdzDataCache = data;
        isLoading = false;
        
        if (DEBUG) {
          const totalTime = performance.now() - startTime;
          console.log(`✅ SAFDZ loaded: ${data.features.length} features (${Math.round(totalTime)}ms)`);
        } else {
          // Single clean success message in production
          console.log(`✅ Map data ready (${data.features.length} zones)`);
        }
        
        return data;
      })
      .catch(error => {
        console.error('❌ SAFDZ load failed:', error);
        isLoading = false;
        safdzDataPromise = null; // Reset promise to allow retry
        throw error;
      });
  }

  return safdzDataPromise;
}

/**
 * Get SAFDZ data - returns immediately if cached, otherwise waits for loading
 */
export async function getSafdzData(): Promise<any> {
  // Return cached data if available
  if (safdzDataCache) {
    return safdzDataCache;
  }

  // If loading hasn't started, initialize it
  if (!safdzDataPromise) {
    initializeSafdzData();
  }

  // Wait for the data to load
  return safdzDataPromise!;
}

/**
 * Get SAFDZ data synchronously if available, null otherwise
 */
export function getSafdzDataSync(): any | null {
  return safdzDataCache;
}

/**
 * Check if SAFDZ data is loaded
 */
export function isSafdzDataLoaded(): boolean {
  return safdzDataCache !== null;
}

/**
 * Check if SAFDZ data is currently loading
 */
export function isSafdzDataLoading(): boolean {
  return isLoading;
}

// Start pre-loading immediately when this module is imported
initializeSafdzData();
