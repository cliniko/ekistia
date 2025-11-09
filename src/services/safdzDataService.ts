/**
 * SAFDZ Data Service - Loads SAFDZ shapefile data on demand
 * This service loads data only when requested, similar to hazard layers.
 *
 * Debug mode: Set VITE_DEBUG_LOADING=true to see detailed logs
 */

import { open } from 'shapefile';

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

    // Load shapefile directly from the public directory
    safdzDataPromise = loadShapefileData()
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
 * Load SAFDZ data from shapefile using the shapefile library
 */
async function loadShapefileData(): Promise<any> {
  try {
    console.log('📁 Loading SAFDZ shapefile...');

    // Fetch the shapefile and dbf files as ArrayBuffers for browser compatibility
    const [shpResponse, dbfResponse] = await Promise.all([
      fetch('/ILIGAN SAFDZ.shp'),
      fetch('/ILIGAN SAFDZ.dbf')
    ]);

    if (!shpResponse.ok || !dbfResponse.ok) {
      throw new Error(`Failed to fetch shapefile: SHP ${shpResponse.status}, DBF ${dbfResponse.status}`);
    }

    const shpBuffer = await shpResponse.arrayBuffer();
    const dbfBuffer = await dbfResponse.arrayBuffer();

    console.log('✅ Shapefile and DBF files fetched successfully');

    // Open the shapefile using ArrayBuffers
    const source = await open(shpBuffer, dbfBuffer);

    console.log('✅ Shapefile opened successfully');

    // Read all features from the shapefile
    const features: any[] = [];
    let result = await source.read();

    while (!result.done) {
      features.push(result.value);
      result = await source.read();
    }

    console.log(`📊 Read ${features.length} features from shapefile`);

    // Convert to GeoJSON format for Mapbox GL
    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    console.log('✅ Converted to GeoJSON format');

    return geojson;
  } catch (error) {
    console.error('❌ Error loading shapefile:', error);
    throw error;
  }
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

// Note: SAFDZ data loading is now controlled by toggle - no longer pre-loaded automatically
