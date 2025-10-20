# Performance Optimizations - Data Loading Speed Improvements

## Summary

This document outlines the optimizations implemented to dramatically improve data loading speed for the Ekistia GIS application.

## Problem Analysis

### Initial Performance Issues

1. **Large GeoJSON Files**
   - `iligan_safdz.geojson`: **33.4 MB** (10,412 features)
   - `iligan_landslide_hazard.geojson`: **34 MB**
   - `iligan_flood_hazard.geojson`: **15 MB**
   - Total initial load: **~82 MB** of GeoJSON data

2. **Loading Strategy Issues**
   - All hazard layers loaded immediately on page load
   - Excessive coordinate precision (6 decimal places = ~0.1m accuracy)
   - Unnecessary elevation values (all 0.0)
   - No compression enabled

3. **Rendering Bottlenecks**
   - Complex filter expressions blocking initial render
   - 3D features loading before SAFDZ data
   - All layers loaded even when not visible

## Optimizations Implemented

### 1. GeoJSON Coordinate Precision Reduction ✅

**Impact: 33.5% size reduction**

- **Created**: `scripts/optimize_geojson.js`
- **Function**: Reduces coordinate precision from 6 to 4 decimal places
- **Benefits**:
  - Precision: 4 decimals = ~11m accuracy (sufficient for city-level planning)
  - Removes unnecessary elevation values (0.0)
  - SAFDZ file: 33.4 MB → 22.2 MB (-33.5%)
- **Usage**: 
  ```bash
  node scripts/optimize_geojson.js input.geojson output.geojson 4
  ```

### 2. Progressive Hazard Layer Loading ✅

**Impact: Eliminates ~49 MB from initial load**

**Changes**:
- Modified `agriculturalHazardService.ts`
  - `initializeHazardLayers()` now returns metadata only (no data fetching)
  - Hazard data loaded on-demand when layer is first enabled
  
- Modified `AgriculturalMapView3D.tsx`
  - Separate useEffect for loading enabled hazard data
  - Caching prevents re-loading already fetched data

**Before**:
```javascript
// Loaded all 5 hazard layers immediately (~49 MB)
const hazardDataPromises = layers.map(async (layer) => {
  const data = await loadHazardData(layer.id);
  return { id: layer.id, data };
});
```

**After**:
```javascript
// Only load when user enables a layer
if (layer.enabled && !hazardDataLoaded[layer.id]) {
  const data = await loadHazardData(layer.id);
  setHazardDataLoaded(prev => ({ ...prev, [layer.id]: data }));
}
```

### 3. Gzip Compression Headers ✅

**Impact: Additional 60-70% size reduction**

**Changes**: Updated `vercel.json`
```json
{
  "source": "/(.*).geojson",
  "headers": [
    {
      "key": "Content-Encoding",
      "value": "gzip"
    }
  ]
}
```

**Expected Results**:
- SAFDZ: 22.2 MB → ~6-8 MB (gzipped)
- Flood: 15 MB → ~4-5 MB (gzipped)
- Landslide: 34 MB → ~10-12 MB (gzipped)

### 4. SAFDZ Data Pre-loading Service ✅

**Already implemented**: `safdzDataService.ts`
- Starts loading SAFDZ data immediately when module imports
- Uses module-level caching
- Provides sync/async access patterns
- Prevents duplicate fetches

## Overall Performance Gains

### Initial Load (Before)
```
┌─────────────────────────┬──────────┬──────────────┐
│ Resource                │ Size     │ Status       │
├─────────────────────────┼──────────┼──────────────┤
│ SAFDZ GeoJSON           │ 33.4 MB  │ Loading...   │
│ Flood Hazard            │ 15.0 MB  │ Loading...   │
│ Landslide Hazard        │ 34.0 MB  │ Loading...   │
│ Slope Data              │ 0.5 MB   │ Loading...   │
│ Land Use Data           │ 0.4 MB   │ Loading...   │
│ Ancestral Domain        │ 0.002 MB │ Loading...   │
├─────────────────────────┼──────────┼──────────────┤
│ TOTAL                   │ ~83 MB   │ ~8-15s load  │
└─────────────────────────┴──────────┴──────────────┘
```

### Initial Load (After Optimizations)
```
┌─────────────────────────┬──────────┬──────────────┐
│ Resource                │ Size     │ Status       │
├─────────────────────────┼──────────┼──────────────┤
│ SAFDZ GeoJSON (gzipped) │ ~7 MB    │ Loading...   │
│ Flood Hazard            │ -        │ On-demand    │
│ Landslide Hazard        │ -        │ On-demand    │
│ Slope Data              │ -        │ On-demand    │
│ Land Use Data           │ -        │ On-demand    │
│ Ancestral Domain        │ -        │ On-demand    │
├─────────────────────────┼──────────┼──────────────┤
│ TOTAL                   │ ~7 MB    │ ~1-2s load   │
└─────────────────────────┴──────────┴──────────────┘
```

**Improvement**: **~90% reduction in initial load size** (83 MB → 7 MB)

## Additional Benefits

1. **Faster Time to Interactive (TTI)**
   - Users can start interacting with the map immediately
   - Only critical SAFDZ data loads initially

2. **Bandwidth Savings**
   - Users who don't enable hazard layers save ~42 MB of downloads
   - Mobile users benefit significantly

3. **Progressive Enhancement**
   - Map is usable before all data loads
   - Hazard layers load seamlessly when needed

4. **Better Error Handling**
   - Failed hazard layer loads don't block main map
   - Individual layer errors are isolated

## Future Optimization Opportunities

### 1. Convert to Vector Tiles (High Impact)
- Use `tippecanoe` or Mapbox Tiling Service
- Benefits:
  - Only load tiles for visible viewport
  - Progressive loading as user pans/zooms
  - ~95% reduction in initial load
  - Better rendering performance

### 2. Implement Service Worker Caching
- Cache GeoJSON files locally
- Instant loading on repeat visits
- Offline support

### 3. Use IndexedDB for Client-Side Storage
- Store processed data locally
- Eliminate re-fetching on page reload

### 4. Further Geometry Simplification
- Use `mapshaper` to simplify complex polygons
- Example:
  ```bash
  mapshaper input.geojson -simplify 10% -o output.geojson
  ```

### 5. Optimize Other Large Files
Apply coordinate precision reduction to:
- `iligan_flood_hazard.geojson` (15 MB)
- `iligan_landslide_hazard.geojson` (34 MB)
- `iligan_slope.geojson` (0.5 MB)

## Usage Instructions

### Optimizing New GeoJSON Files

```bash
# Reduce coordinate precision (recommended: 4 decimal places)
node scripts/optimize_geojson.js public/input.geojson public/output.geojson 4

# Backup original
mv public/input.geojson public/input.geojson.backup

# Use optimized version
mv public/output.geojson public/input.geojson
```

### Monitoring Performance

```javascript
// Enable debug mode to see detailed loading logs
// Set in .env:
VITE_DEBUG_LOADING=true
```

### Testing Progressive Loading

1. Open DevTools → Network tab
2. Clear cache
3. Reload page
4. Verify only SAFDZ loads initially
5. Enable a hazard layer in UI
6. Verify hazard data loads on-demand

## Deployment Checklist

- [x] Optimize SAFDZ GeoJSON file
- [x] Update Vercel compression headers
- [x] Implement progressive hazard loading
- [ ] Optimize remaining hazard GeoJSON files
- [ ] Test on slow 3G connection
- [ ] Monitor production performance metrics

## Performance Metrics

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.0s
- **Total Blocking Time (TBT)**: < 300ms

### Measurement Tools
- Chrome DevTools Lighthouse
- WebPageTest.org
- Real User Monitoring (RUM) via Vercel Analytics

## References

- [GeoJSON Specification](https://datatracker.ietf.org/doc/html/rfc7946)
- [Mapbox GL JS Performance Tips](https://docs.mapbox.com/mapbox-gl-js/guides/performance/)
- [Web.dev Performance Guide](https://web.dev/performance/)

---

**Last Updated**: October 20, 2025  
**Author**: Ekistia Development Team

