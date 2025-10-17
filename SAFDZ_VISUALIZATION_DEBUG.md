# SAFDZ Visualization Debugging Guide

## Issues Identified

### 1. **Missing Property Type Definition** ✅ FIXED
**Problem:** The `selectedBarangays` property was referenced in filter logic but not defined in the TypeScript interface.

**Fixed:** Added optional `selectedBarangays?: string[]` to the interface.

### 2. **Complex Filter Conditions** ⚠️ LIKELY CAUSE
The SAFDZ layers use very restrictive filters that require ALL of these conditions to be true:
- ✅ Size category (large/medium/small/micro)
- ✅ Hectare range (minHectares to maxHectares)
- ✅ LMU category (111, 112, 113, or 117)
- ✅ Zoning type (Strategic Agriculture)
- ✅ Land use type (Agriculture)
- ✅ Class type (rural)
- ✅ Barangay name (if filtering)
- ✅ Search term (if searching)

**If ANY condition fails, the entire feature is hidden.**

## Debugging Steps

### Step 1: Check Browser Console
Open the browser console (F12) and look for these log messages:

```
✅ SAFDZ data loaded: {X} features
✅ SAFDZ source added to map
📊 SAFDZ data features: {X}
🔍 Current filters: {...}
📌 Sample feature: {...}
✅ SAFDZ fill layer added
✅ SAFDZ test layer added (hidden)
🔍 Total features in source: {X}
👁️ Visible SAFDZ features on screen: {X}
```

### Step 2: Check Feature Count
- **Total features**: Should show ~175 zones
- **Visible features**: If 0, filters are too restrictive

### Step 3: Test with Unfiltered Layer
To see ALL SAFDZ zones without filters, run this in the browser console:

```javascript
window.map.setLayoutProperty("safdz-fill-test", "visibility", "visible")
```

This will show a semi-transparent red overlay of all SAFDZ zones, proving the data is loading correctly.

To hide it again:
```javascript
window.map.setLayoutProperty("safdz-fill-test", "visibility", "none")
```

### Step 4: Verify Data Structure
Check a sample feature in the console:
```javascript
window.map.querySourceFeatures('safdz-zones')[0].properties
```

Expected properties:
- `HECTARES`: number (e.g., 13.249)
- `LMU_CODE`: string (e.g., "117")
- `ZONING`: string (e.g., "Strategic Agriculture")
- `LANDUSE`: string (e.g., "Agriculture")
- `CLASS`: string (e.g., "rural")
- `BRGY`: string (barangay name)

## Common Issues & Solutions

### Issue: No zones visible at all
**Possible causes:**
1. All filters are too restrictive
2. Data file not loading
3. Mapbox token issue

**Solutions:**
1. Check console for warnings
2. Use the test layer (see Step 3)
3. Verify all filter categories are enabled in the UI
4. Check that LMU categories 111, 112, 113, 117 are all enabled

### Issue: Only a few zones visible
**Possible causes:**
1. Hectare range is too narrow
2. Size categories are disabled
3. Search filter is active

**Solutions:**
1. Expand hectare range to 0-1000
2. Enable all size categories (Large, Medium, Small, Micro)
3. Clear the barangay search filter
4. Ensure all LMU categories are enabled

### Issue: Zones appear/disappear when zooming
**Expected behavior:** This is normal - Mapbox only renders features in the current viewport for performance.

## Filter Defaults

The default filters should show most zones:
```javascript
{
  sizeCategories: {
    large: true,    // >= 100 hectares
    medium: true,   // 50-100 hectares
    small: true,    // 20-50 hectares
    micro: true     // < 20 hectares
  },
  minHectares: 0,
  maxHectares: 1000,
  lmuCategories: {
    '111': true,  // Prime Agricultural Land
    '112': true,  // Good Agricultural Land
    '113': true,  // Fair Agricultural Land
    '117': true   // Marginal Agricultural Land
  },
  zoningTypes: {
    'Strategic Agriculture': true
  },
  landUseTypes: {
    'Agriculture': true
  },
  classTypes: {
    'rural': true
  }
}
```

## Quick Fix: Simplify Filters

If you want to see all zones immediately, you can temporarily simplify the filter logic:

1. Open `AgriculturalMapView3D.tsx`
2. Find the `safdz-fill` layer definition (around line 424)
3. Replace the complex `filter` array with just:
   ```javascript
   filter: ['has', 'HECTARES']
   ```

This will show ALL zones that have a HECTARES property (which should be all of them).

## Testing Checklist

- [ ] Console shows "SAFDZ data loaded" message
- [ ] Console shows 175+ features loaded
- [ ] Test layer can be toggled visible
- [ ] Red overlay appears when test layer is visible
- [ ] "SAFDZ ON" button shows in UI
- [ ] "175 zones" indicator shows in bottom left
- [ ] Filters UI is accessible
- [ ] All filter categories are enabled
- [ ] Mapbox token is valid (no 401 errors)

## Additional Debug Commands

```javascript
// Check all layer IDs
window.map.getStyle().layers.map(l => l.id)

// Check SAFDZ layer visibility
window.map.getLayoutProperty('safdz-fill', 'visibility')

// Force show main SAFDZ layer
window.map.setLayoutProperty('safdz-fill', 'visibility', 'visible')

// Check filter on layer
window.map.getFilter('safdz-fill')

// Remove filter temporarily
window.map.setFilter('safdz-fill', null)

// Count features in viewport
window.map.queryRenderedFeatures(undefined, {layers: ['safdz-fill']}).length

// Fly to SAFDZ bounds
window.map.fitBounds([[124.26, 8.30], [124.35, 8.32]], {padding: 50})
```

## Expected Results

When working correctly, you should see:
- **175 colored zones** across Iligan City
- **Color-coded by size**: Red (large), Orange (medium), Yellow (small), Green (micro)
- **Zone boundaries** in white/matching colors
- **Labels** showing hectare size
- **Clickable zones** that show details in sidebar

## Contact & Support

If issues persist after following this guide:
1. Check browser console for errors
2. Verify Mapbox token is valid
3. Ensure GeoJSON file is accessible at `/safdz_agri_barangays.geojson`
4. Try clearing browser cache and reloading

