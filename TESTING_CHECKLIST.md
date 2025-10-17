# Hazard Layers Testing Checklist

## Overview
This checklist helps you verify that the hazard layers are now working correctly on both map views.

---

## 🎯 Quick Test (2 minutes)

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Pothole Map (Leaflet-based)
**URL**: `http://localhost:5173/`

**Steps**:
1. ✅ Look for **"Hazard Layers"** button (top-right, orange icon)
2. ✅ Click to expand the panel
3. ✅ Enable **Flood Hazard Zones**
4. ✅ Confirm you see colored areas on the map (green/orange/red)
5. ✅ Click on a colored area → popup should show flood risk details
6. ✅ Check legend (bottom-right) shows flood risk levels

### 3. Test Agricultural Map (Mapbox-based)
**URL**: `http://localhost:5173/ekistia`

**Steps**:
1. ✅ Look for **"Hazard Layers"** button (top-right)
2. ✅ Click to expand the panel
3. ✅ Enable **Landslide Susceptibility**
4. ✅ Confirm you see colored areas on the map
5. ✅ Toggle opacity slider → areas should become more/less transparent
6. ✅ Enable multiple layers simultaneously

---

## 🔍 Detailed Testing

### Browser Console Check
Open Developer Tools (F12) and look for these messages:

#### ✅ Expected Success Messages:
```
⏳ Loading hazard data for flood from /iligan_flood_hazard.geojson...
✅ Loaded 2849 features for flood
🗺️ Updating hazard layers. Enabled: [flood]
📍 Adding flood layer with 2849 features
✅ Successfully added flood layer to map
```

#### ❌ Error Messages (Report These):
```
❌ Error loading hazard data for [type]
⚠️ Hazard layer [id] not found
⚠️ Hazard layer [id] has no data
```

---

## 📋 Feature Verification Matrix

| Feature | Pothole Map | Agricultural Map | Status |
|---------|-------------|------------------|--------|
| **Flood Layers** | ✅ | ✅ | Fixed |
| **Landslide Layers** | ✅ | ✅ | Fixed |
| **Slope Analysis** | ✅ | ✅ | Working |
| **Land Use** | ✅ | ✅ | Working |
| **Ancestral Domain** | ✅ | ✅ | Working |
| **Layer Toggle** | ✅ | ✅ | Working |
| **Opacity Control** | ✅ | ✅ | Working |
| **Popup Information** | ✅ | ✅ | Fixed |
| **Legend Display** | ✅ | ✅ | Working |
| **Hover Effects** | ✅ | ✅ | Working |

---

## 🎨 Visual Verification

### Expected Color Schemes

#### Flood Risk
- 🟢 **Green** = Low Risk (LF)
- 🟠 **Orange** = Medium Risk (MF)
- 🔴 **Red** = High Risk (HF)

#### Landslide Susceptibility
- 🟢 **Green** = Low (LL/L)
- 🟠 **Orange** = Medium (ML/M)
- 🔴 **Red** = High (HL/H)
- 🔴 **Dark Red** = Very High (VHL/VH)

#### Slope Classification
- 🟢 **Green** = Flat (0-5°)
- 🟢 **Light Green** = Gentle (5-15°)
- 🟡 **Yellow** = Moderate (15-30°)
- 🟠 **Orange** = Steep (30-45°)
- 🔴 **Red** = Very Steep (>45°)

---

## 🐛 Known Issues & Limitations

### Large File Sizes
- **Flood data**: 15 MB (~2,849 features)
- **Landslide data**: 34 MB (~thousands of features)
- **Initial load**: May take 2-5 seconds
- **After first load**: Cached (instant)

### Performance Notes
- Multiple layers enabled = slower rendering
- Zoom in for better performance with large datasets
- Consider reducing opacity for overlapping layers

---

## ✅ What Was Fixed

### 1. Property Name Mismatch
**Problem**: GeoJSON files had truncated property names
- Landslide: `"LndslideSu"` vs expected `"LandslideSusc"`
- Values: `"HL"` vs expected `"H"`

**Solution**: Added property name mapping in `hazardDataService.ts`

### 2. Slope Data Format
**Problem**: Slope values were range strings (`"8-18"`) not numbers

**Solution**: Added regex parser to extract numeric values

### 3. TypeScript Errors
**Problem**: Type casting errors with Leaflet layer styling

**Solution**: Added proper type guards and casting

### 4. Missing Console Logs
**Problem**: Hard to debug loading issues

**Solution**: Added comprehensive debug logging

---

## 🚀 Next Steps (If Everything Works)

### Optional Enhancements
1. **Performance Optimization**
   - Simplify large GeoJSON files using `mapshaper`
   - Implement progressive loading

2. **Enhanced Features**
   - Add hazard analysis tools
   - Implement area measurement
   - Add risk assessment reports

3. **User Experience**
   - Add layer download functionality
   - Implement saved layer configurations
   - Add keyboard shortcuts

---

## 📞 Reporting Issues

If you encounter problems, please provide:

1. **Browser Console Output** (F12 → Console tab)
2. **Network Tab** (Check if GeoJSON files loaded)
3. **Screenshots** of the map
4. **Steps to reproduce** the issue
5. **Browser & OS** information

---

## 🎓 Technical Details

### Architecture
- **Pothole Map**: Leaflet.js + OpenStreetMap
- **Agricultural Map**: Mapbox GL JS + Mapbox Streets
- **Data Format**: GeoJSON (RFC 7946)
- **Data Source**: Public directory (`/public/*.geojson`)

### Data Flow
```
User enables layer
  ↓
Check cache
  ↓ (if not cached)
Fetch GeoJSON from /public
  ↓
Parse features
  ↓
Apply color mapping
  ↓
Add to map
  ↓
Update legend
```

### Files Modified
1. `/src/services/hazardDataService.ts` - Fixed property mappings
2. `/src/components/MapView.tsx` - Enhanced debugging & type safety
3. `/src/services/agriculturalHazardService.ts` - Already correct

---

**Last Updated**: October 17, 2025  
**Version**: 2.0  
**Status**: ✅ Ready for Testing

