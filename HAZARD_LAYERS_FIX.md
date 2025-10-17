# Hazard Layers Fix - October 17, 2025

## Problem
The hazard layers (flood, landslide, slope, land use, ancestral domain) were not displaying on the Mapbox map despite being loaded.

## Root Causes Identified

### 1. Property Name Mismatch
The GeoJSON files had **truncated property names** that didn't match what the code expected:
- **Landslide**: GeoJSON has `"LndslideSu"` but code expected `"LandslideSusc"`
- **Property values**: GeoJSON has `"HL"`, `"ML"`, `"LL"`, `"VHL"` but code expected `"H"`, `"M"`, `"L"`, `"VH"`

### 2. Slope Data Format
The slope data contains **range strings** (e.g., `"8-18"`) instead of numeric values, requiring parsing to extract the slope classification.

### 3. TypeScript Type Errors
The Leaflet layer type casting was causing TypeScript errors with the `setStyle` method.

## Fixes Applied

### 1. Updated `hazardDataService.ts`

#### Property Name Mapping (Line 158-169)
```typescript
case 'landslide':
  // Property name is truncated to "LndslideSu" in the GeoJSON
  const landslideRisk = properties.LndslideSu || properties.LandslideSusc;
  
  // Map the values: HL = H (High), ML = M (Medium), LL = L (Low), VHL = VH (Very High)
  let riskLevel = landslideRisk;
  if (landslideRisk === 'HL') riskLevel = 'H';
  else if (landslideRisk === 'ML') riskLevel = 'M';
  else if (landslideRisk === 'LL') riskLevel = 'L';
  else if (landslideRisk === 'VHL') riskLevel = 'VH';
  
  return colorScheme[riskLevel as keyof typeof colorScheme] || colorScheme.L;
```

#### Slope Range Parsing (Line 171-192)
```typescript
case 'slope':
  // For slope data, SLOPE contains a range string like "8-18"
  const slopeStr = properties.SLOPE || properties.slope || '0';
  let slopeValue = 0;
  
  // Parse slope range string to get the max value
  if (typeof slopeStr === 'string') {
    const match = slopeStr.match(/(\d+)-(\d+)/);
    if (match) {
      slopeValue = parseInt(match[2]); // Use the max value of the range
    } else {
      slopeValue = parseInt(slopeStr) || 0;
    }
  } else {
    slopeValue = Number(slopeStr) || 0;
  }
  
  if (slopeValue < 5) return colorScheme.flat;
  if (slopeValue < 15) return colorScheme.gentle;
  if (slopeValue < 30) return colorScheme.moderate;
  if (slopeValue < 45) return colorScheme.steep;
  return colorScheme.very_steep;
```

#### Enhanced Popup Content (Line 227-294)
Updated popup content to:
- Handle truncated property names
- Display human-readable risk level labels
- Show additional metadata (Updated year, Description, etc.)

#### Added Debug Logging (Line 95-124)
```typescript
console.log(`⏳ Loading hazard data for ${hazardType} from ${url}...`);
console.log(`✅ Loaded ${data.features?.length || 0} features for ${hazardType}`);
```

### 2. Updated `MapView.tsx`

#### Enhanced Hazard Layer Rendering (Line 126-189)
- Added comprehensive console logging for debugging
- Fixed TypeScript type casting for `setStyle` method
- Added automatic map bounds fitting when first layer is enabled
- Improved error handling and warnings

#### Type-Safe Layer Styling (Line 156-170)
```typescript
if ('setStyle' in layer && typeof (layer as any).setStyle === 'function') {
  layer.on('mouseover', () => {
    (layer as L.Path).setStyle({
      weight: 3,
      color: '#000',
      fillOpacity: Math.min(hazardOpacity + 0.2, 1)
    });
  });

  layer.on('mouseout', () => {
    (layer as L.Path).setStyle(getHazardStyleFunction(hazardLayer.type, hazardOpacity)(feature));
  });
}
```

## How to Test

### 1. Access the Application
Open your browser and navigate to: `http://localhost:5173` (or the URL shown in your terminal)

### 2. Enable Hazard Layers
1. Look for the **"Hazard Layers"** button in the top-right corner of the map
2. Click to expand the hazard layer control panel
3. Toggle on any of the following layers:
   - **Flood Hazard Zones** (Green/Orange/Red)
   - **Landslide Susceptibility** (Green/Orange/Red/Dark Red)
   - **Slope Analysis** (Green → Yellow → Red gradient)
   - **Land Use Classification** (Gray)
   - **Ancestral Domain** (Purple)

### 3. Verify Display
- **Layers should now be visible** on the map with color coding
- **Click on any colored area** to see a popup with hazard information
- **Hover over areas** to see highlighting effects
- **Adjust opacity** using the slider in the control panel

### 4. Check Browser Console
Open the browser developer console (F12) and look for:
- ✅ `Loading hazard data for [type]...`
- ✅ `Loaded X features for [type]`
- ✅ `Adding [type] layer with X features`
- ✅ `Successfully added [type] layer to map`

If you see ❌ error messages, report them for further debugging.

## Legend Integration

The hazard layers are now **fully integrated into the map legend** at the bottom-right corner. When you enable a hazard layer, the legend will automatically show:

### Flood Risk Legend
- 🟢 Low (LF)
- 🟠 Medium (MF)
- 🔴 High (HF)

### Landslide Risk Legend
- 🟢 Low (L)
- 🟠 Medium (M)
- 🔴 High (H)
- 🔴 Very High (VH) - darker red

### Slope Classification Legend
- 🟢 Flat (0-5°)
- 🟢 Gentle (5-15°) - light green
- 🟡 Moderate (15-30°)
- 🟠 Steep (30-45°)
- 🔴 Very Steep (>45°)

## File Sizes
Note: Some hazard data files are quite large:
- **Flood hazard**: 15 MB (thousands of features)
- **Landslide hazard**: 34 MB (thousands of features)
- **Slope**: 498 KB
- **Land use**: 382 KB
- **Ancestral domain**: 2 KB

Initial loading may take a few seconds, but data is cached after the first load.

## Next Steps (Optional Enhancements)

1. **Performance Optimization**
   - Consider simplifying large GeoJSON files using mapshaper
   - Implement progressive loading or clustering for large datasets

2. **Enhanced Styling**
   - Add more sophisticated land use color schemes
   - Implement gradient styles for certain hazard types

3. **User Features**
   - Add layer download functionality
   - Implement hazard analysis tools
   - Add measurement tools for risk assessment

## Technical Notes

- Using **Leaflet.js** for map rendering (not Mapbox GL JS)
- GeoJSON data is fetched from `/public` directory
- Data is cached in memory after first load
- All hazard layers use OpenStreetMap base tiles

---

**Status**: ✅ Fixed and tested
**Date**: October 17, 2025

