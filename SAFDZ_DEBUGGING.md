# SAFDZ Visualization Debugging Guide

## Current Status

The SAFDZ implementation is complete with:
- ✅ GeoJSON file converted and available at `public/iligan_safdz.geojson` (10,412 features, 53MB)
- ✅ Color scheme implemented with official SAFDZ classifications
- ✅ Map layer configuration with proper Mapbox GL expressions
- ✅ Data service loading the correct file
- ✅ Debug logging added to track data flow

## To Debug and Verify

### 1. Start the Dev Server
```bash
cd /Users/leonhelfortin/Project/ekistia
npm run dev
```

### 2. Open Browser Developer Tools
1. Open your browser (Chrome/Firefox/Safari)
2. Navigate to `http://localhost:5173`
3. Open Developer Tools (F12 or Cmd+Option+I on Mac)
4. Go to the Console tab

### 3. Check for Debug Messages

You should see these console logs in order:

#### ✅ Data Loading:
```
✅ SAFDZ data loaded: {features: 10412, sampleSAFDZ: ["1", "1", "1"]}
```

#### ✅ Layer Addition:
```
🗺️ Adding SAFDZ source with 10412 features
✅ SAFDZ fill layer added to map
✅ SAFDZ outline layer added to map
```

### 4. Check Network Tab

1. Open Developer Tools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for `iligan_safdz.geojson`
4. Verify it loads successfully (Status: 200)
5. Size should be ~53MB

### 5. Visual Verification

You should see colored zones on the map:
- 🟢 Light Green zones (Strategic CCP)
- 🟣 Purple zones (Livestock)
- 🟠 Orange zones (Rangelands/PAAD) - Most common
- 🌲 Dark Green zones (Forestry)
- ⚫ Gray zones (Built-up areas)
- 💧 Blue zones (Water bodies)

### 6. Test Layer Visibility

There's a red test layer (`safdz-fill-test`) enabled for debugging:
- If you see ANY zones in bright red (#ff0000), the GeoJSON is loading correctly
- This confirms the data and rendering pipeline work
- If you see red zones but not the colored ones, there's an issue with the color expression

### 7. Check Map Object in Console

The map object is available globally for debugging:
```javascript
// In browser console:
window.map

// Check if source exists:
window.map.getSource('safdz-zones')

// Check if layers exist:
window.map.getLayer('safdz-fill')
window.map.getLayer('safdz-outline')
window.map.getLayer('safdz-fill-test')

// Get layer visibility:
window.map.getLayoutProperty('safdz-fill', 'visibility')

// Query features at a point (click on map first):
window.map.queryRenderedFeatures([500, 400], { layers: ['safdz-fill'] })
```

## Common Issues and Solutions

### Issue 1: No Console Logs Appear
**Problem**: Component not mounting or data service not loading
**Solution**: 
- Check if you're on the correct page (should be Ekistia agricultural map)
- Verify React DevTools shows AgriculturalMapView3D is mounted
- Check for JavaScript errors in console

### Issue 2: "Failed to load SAFDZ data" Error
**Problem**: GeoJSON file not accessible
**Solution**:
```bash
# Verify file exists
ls -lh public/iligan_safdz.geojson

# Check file is valid JSON
python3 -c "import json; json.load(open('public/iligan_safdz.geojson'))" && echo "Valid JSON"
```

### Issue 3: Layers Added but Not Visible
**Problem**: Layer ordering or styling issue
**Solution**:
- Check if test layer (red) is visible
- If yes: Color expression issue, verify SAFDZ values in data
- If no: Rendering issue, check map style and layer ordering

### Issue 4: File Loading is Very Slow
**Problem**: 53MB file takes time to load
**Solution**:
- Wait 5-10 seconds for initial load
- Check Network tab for progress
- Consider simplifying geometries if needed

## Quick Verification Commands

### In Terminal:
```bash
# Check if server is running
lsof -ti:5173

# Verify GeoJSON file
ls -lh public/iligan_safdz.geojson
head -n 30 public/iligan_safdz.geojson

# Test data structure
python3 -c "
import json
data = json.load(open('public/iligan_safdz.geojson'))
print(f'Features: {len(data[\"features\"])}')
print(f'First SAFDZ: {data[\"features\"][0][\"properties\"][\"SAFDZ\"]}')
"
```

### In Browser Console:
```javascript
// Check if layers are rendering
const features = window.map.queryRenderedFeatures({ layers: ['safdz-fill'] });
console.log(`Rendered features: ${features.length}`);

// Check specific SAFDZ values
features.slice(0, 5).forEach(f => {
  console.log(`SAFDZ: ${f.properties.SAFDZ}, Color should be visible`);
});

// Toggle test layer visibility
window.map.setLayoutProperty('safdz-fill-test', 'visibility', 'none'); // Hide red
window.map.setLayoutProperty('safdz-fill-test', 'visibility', 'visible'); // Show red
```

## Expected Behavior

When working correctly:
1. Page loads with map view
2. Console shows "✅ SAFDZ data loaded" within 5-10 seconds
3. Console shows layer addition messages
4. Map displays colored polygons across Iligan City
5. Legend shows SAFDZ color dots
6. Clicking on zones would show their classification (if click handler implemented)
7. Total zones counter shows "10412" in bottom left

## File Sizes and Performance

- **GeoJSON Size**: 53MB (10,412 features)
- **Load Time**: 3-10 seconds depending on connection
- **Render Time**: 1-2 seconds after load
- **Memory Usage**: ~100-200MB in browser

## Contact/Support

If issues persist:
1. Save browser console output
2. Save Network tab screenshot showing failed requests
3. Note which debug messages appear vs. which don't
4. Check browser version (Mapbox GL JS requires modern browsers)

