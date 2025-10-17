# SAFDZ Data Flow Performance Analysis

## Current Data Flow

### 1. **Initial Load Sequence**
```
App Start (main.tsx)
  ↓
Import safdzDataService (starts pre-loading immediately)
  ↓
Fetch /safdz_agri_barangays.geojson (539KB)
  ↓
EkistiaIndex component mounts
  ↓
Check if safdzData is loaded
  ↓
Pass safdzData to AgriculturalMapView3D
  ↓
Map component initializes (Mapbox GL)
  ↓
handleMapLoad() - adds terrain, 3D buildings, fog, lighting
  ↓
useEffect waits for: map ready + safdzData loaded + style loaded
  ↓
Add SAFDZ layers to map
```

### 2. **Identified Bottlenecks**

#### **A. Network Loading (539KB GeoJSON)**
- **File Size**: 539KB uncompressed
- **Loading Method**: Simple `fetch()` without compression hints
- **Timing**: Starts immediately but may take 500ms-2s depending on connection
- **Issue**: Not cached, reloads on every page refresh

#### **B. Sequential Dependencies**
The SAFDZ layers cannot be added until ALL of these are true:
```javascript
if (!map || !safdzData || safdzLoading || safdzError) return;
```

This means:
1. Map must be initialized
2. Map style must be fully loaded
3. SAFDZ data must be fetched
4. handleMapLoad() must complete (adds terrain, buildings, fog)

#### **C. Complex Filter Expressions**
Each SAFDZ layer (fill, outline, labels) has complex filter expressions:
- Size category filters (4 conditions)
- Hectare range filters
- LMU category filters (4 conditions)
- Zoning filters
- Land use filters
- Class filters
- Barangay filters
- Search filters

**Total filter operations per feature**: ~20+ conditional checks
**Number of features**: 200+ zones
**Total computations**: 4000+ filter evaluations on initial render

#### **D. Multiple Layer Dependencies**
```
addSafdzLayers() runs when:
- safdzData changes
- mapStyle changes
```

This causes layer recreation on style changes, adding delay.

#### **E. Heavy onLoad Operations**
`handleMapLoad()` performs multiple expensive operations:
- Iterates through all map style layers to hide labels
- Adds terrain source (DEM tiles)
- Sets terrain with interpolation
- Adds 3D buildings layer
- Sets fog effects
- Sets lighting

All before SAFDZ layers can be added.

### 3. **Performance Measurements**

Based on code analysis:

| Operation | Estimated Time | Impact |
|-----------|---------------|--------|
| Fetch GeoJSON (539KB) | 500-2000ms | **HIGH** |
| Parse JSON | 50-100ms | Medium |
| Map initialization | 500-1000ms | **HIGH** |
| Style loading | 300-800ms | **HIGH** |
| Terrain/3D setup | 200-400ms | Medium |
| SAFDZ layer addition | 100-300ms | Medium |
| Filter evaluation | 50-200ms | Medium |
| **Total initial load** | **1700-4800ms** | **CRITICAL** |

### 4. **Root Causes of Slow Display**

1. **Network Waterfall**: GeoJSON loads after app bundle, delaying data availability
2. **Blocking Operations**: Terrain/3D setup blocks SAFDZ layer addition
3. **No Progressive Loading**: All-or-nothing approach (entire GeoJSON or nothing)
4. **Complex Filters**: Heavy computation on initial render
5. **No Visual Feedback**: User sees blank map until everything is ready

## Recommended Optimizations

### **Priority 1: Immediate Wins**

#### 1. Add Loading Skeleton/Indicator
Show visual feedback while SAFDZ data loads:
```typescript
{safdzLoading && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <Loader2 className="animate-spin" />
      <p>Loading agricultural zones...</p>
    </div>
  </div>
)}
```

#### 2. Optimize GeoJSON Loading
- **Enable Gzip compression** on server
- **Expected savings**: 539KB → ~100KB (81% reduction)
- **Time saved**: 1-1.5 seconds

#### 3. Simplify Initial Layer Filters
Start with no filters, then apply them after render:
```javascript
// Initial render: show all features
filter: ['literal', true]

// Then update filters after initial display
setTimeout(() => applyFilters(), 100);
```

#### 4. Defer Non-Critical Map Features
Move terrain/3D/fog setup to after SAFDZ layers are visible:
```javascript
// Add SAFDZ layers immediately on map load
// Add terrain/3D/fog after a delay
setTimeout(() => add3DFeatures(), 500);
```

### **Priority 2: Medium-term Improvements**

#### 5. Implement Vector Tiles
Convert GeoJSON to vector tiles (PBF format):
- Only loads visible tiles
- Much smaller file sizes
- Progressive loading
- Better performance at all zoom levels

#### 6. Add Service Worker Caching
Cache the GeoJSON file for instant subsequent loads:
```javascript
// Cache SAFDZ data for 1 day
cache.put('/safdz_agri_barangays.geojson', response);
```

#### 7. Simplify Feature Properties
Remove unused properties from GeoJSON to reduce file size.

#### 8. Pre-compute Filter Results
Create separate sources for different filter combinations to avoid runtime computation.

### **Priority 3: Advanced Optimizations**

#### 9. Implement Data Pagination
Load zones progressively based on viewport and zoom level.

#### 10. Use Web Workers
Offload GeoJSON parsing and filter computation to Web Workers.

#### 11. Implement IndexedDB Storage
Store parsed GeoJSON in IndexedDB for instant retrieval.

## Expected Impact of Optimizations

| Optimization | Time Saved | Implementation Effort |
|--------------|------------|---------------------|
| Gzip compression | 1000-1500ms | Low (1 hour) |
| Loading indicator | 0ms (UX only) | Low (30 mins) |
| Simplified initial filters | 200-400ms | Low (2 hours) |
| Defer 3D features | 300-500ms | Medium (3 hours) |
| Vector tiles | 1500-3000ms | High (2-3 days) |
| Service Worker cache | 1500-2000ms (subsequent) | Medium (4 hours) |

## Implementation Roadmap

### Phase 1: Quick Wins (1 day)
1. ✅ Add loading skeleton
2. ✅ Enable Gzip compression
3. ✅ Simplify initial filters
4. ✅ Add visual feedback

**Expected result**: 2-3 second improvement on first load

### Phase 2: Caching (1 day)
1. ✅ Implement Service Worker
2. ✅ Add IndexedDB fallback
3. ✅ Cache validation strategy

**Expected result**: Instant load on subsequent visits

### Phase 3: Architecture (3-5 days)
1. ✅ Convert to vector tiles
2. ✅ Implement progressive loading
3. ✅ Optimize layer rendering

**Expected result**: Sub-second initial display, smooth zooming

## Monitoring Recommendations

Add performance tracking:
```javascript
performance.mark('safdz-fetch-start');
// ... fetch operation ...
performance.mark('safdz-fetch-end');
performance.measure('safdz-fetch', 'safdz-fetch-start', 'safdz-fetch-end');
```

Track these metrics:
- Time to fetch GeoJSON
- Time to parse JSON
- Time to add layers
- Time to first pixel (SAFDZ visible)
- Filter update performance

