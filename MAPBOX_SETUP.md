# 3D Map Setup with Mapbox Boundaries v4.5

Your agricultural map has been upgraded to use Mapbox Boundaries v4.5 for official barangay boundaries with 3D visualization!

## Features

🗺️ **Mapbox Boundaries v4.5**: Official administrative boundaries from Mapbox Enterprise tileset
🇵🇭 **Philippine Barangays**: Admin level 4 boundaries for accurate barangay visualization
✨ **Dynamic 3D Terrain**: Adaptive elevation exaggeration that adjusts with zoom level
🏢 **3D Buildings**: Smooth fade-in with vertical gradient shading for realistic depth
🌫️ **Atmospheric Fog**: Distance-based fog with horizon blending and starfield
💡 **Dynamic Lighting**: Viewport-anchored ambient lighting for enhanced 3D appearance
🎮 **Interactive Controls**: Rotate, tilt, and navigate the map in 3D
📊 **Agricultural Data**: Suitability zones rendered on 3D terrain with click interactions

## Setup Instructions

### 1. Get Mapbox Enterprise Access

**Important**: Mapbox Boundaries v4.5 requires a Mapbox Enterprise plan.

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Contact Mapbox Sales to request access to Boundaries tilesets
3. You can request a free data sample to explore what's available
4. Once approved, navigate to "Access tokens" in your account
5. Create a token with Boundaries tileset permissions

### 2. Configure Your Environment

Add your Mapbox token to the `.env` file:

```bash
VITE_MAPBOX_TOKEN=pk.your_actual_mapbox_token_here
```

**Important**:
- The `.env` file is gitignored to keep your token secure
- Never commit your actual token to version control
- Share the `.env.example` file with your team instead

### 3. Run the Application

```bash
npm run dev
```

## 3D Controls

### Mouse Controls
- **Left Click + Drag**: Pan the map
- **Right Click + Drag**: Rotate the map around the center
- **Ctrl/Cmd + Drag**: Change the pitch (tilt angle)
- **Scroll Wheel**: Zoom in/out

### UI Controls
- **3D View / 2D View Button**: Toggle between 2D (pitch: 0°) and 3D (pitch: 45°) views
- **Reset View Button**: Reset the map to default pitch and bearing

## Map Layers

1. **Base Layer**: Mapbox Streets style with labels
2. **Terrain Layer**: 3D elevation with dynamic exaggeration (2.5x at far zoom → 1.2x at close zoom)
3. **Mapbox Boundaries v4.5**: Official admin level 4 (barangay) boundaries for Philippines
   - Source: `mapbox://mapbox.enterprise-boundaries-a4-v4`
   - Filtered to Philippines only (ISO 3166-1: 'PH')
   - Colored by agricultural suitability data
4. **3D Buildings**: Smooth fade-in starting at zoom level 14, fully visible at 15+
5. **Atmospheric Fog**: Distance-based fog with horizon blending and stars
6. **Dynamic Lighting**: Viewport-anchored ambient lighting for depth

## Customization

### Terrain Exaggeration
The terrain now uses dynamic zoom-based exaggeration for better realism. Adjust values in `AgriculturalMapView3D.tsx:216-226`:
```typescript
map.setTerrain({
  source: 'mapbox-dem',
  exaggeration: [
    'interpolate',
    ['linear'],
    ['zoom'],
    10, 2.5,  // More dramatic at far zoom
    14, 1.8,  // Moderate at medium zoom
    18, 1.2   // Subtle at close zoom - adjust these values
  ]
});
```

### Default View Angle
Change the initial pitch in `AgriculturalMapView3D.tsx:23`:
```typescript
pitch: 45, // 0 = flat, 60 = steep angle
```

### 3D Buildings Appearance
Customize building colors and fade-in behavior in `AgriculturalMapView3D.tsx:239-270`:
```typescript
paint: {
  'fill-extrusion-color': [
    'interpolate',
    ['linear'],
    ['get', 'height'],
    0, '#e0e0e0',  // Color for short buildings
    100, '#606060'  // Color for tall buildings
  ],
  'fill-extrusion-opacity': 0.85, // Adjust 0-1
  'fill-extrusion-vertical-gradient': true // Creates realistic shading
}
```

### Fog and Atmosphere
Customize the atmospheric effect in `AgriculturalMapView3D.tsx:275-282`:
```typescript
map.setFog({
  color: 'rgb(200, 220, 240)', // Near fog color
  'high-color': 'rgb(100, 150, 220)', // Sky color
  'horizon-blend': 0.05, // 0-1, higher = more blending
  'space-color': 'rgb(20, 30, 50)', // Night sky color
  'star-intensity': 0.4, // 0-1, stars visibility
  range: [2, 10] // [start, end] distance for fog
});
```

### Map Style
Switch to different Mapbox styles in `AgriculturalMapView3D.tsx:307`:
```typescript
mapStyle="mapbox://styles/mapbox/streets-v12"
// Other options:
// - "mapbox://styles/mapbox/satellite-streets-v12"
// - "mapbox://styles/mapbox/outdoors-v12"
// - "mapbox://styles/mapbox/light-v11"
// - "mapbox://styles/mapbox/dark-v11"
```

## Troubleshooting

### Map doesn't load
- Check that your Mapbox token is correctly set in `.env`
- Ensure the token has the required permissions (default public token should work)
- Check browser console for any errors

### 3D terrain not visible
- Zoom in closer (terrain becomes more visible at zoom 12+)
- Increase the exaggeration value
- Ensure you're in 3D view mode (pitch > 0)

### Performance issues
- Reduce terrain exaggeration
- Use a simpler map style (streets instead of satellite)
- Disable 3D buildings by removing the layer from the code

## Migration from PSA Boundaries

The project has been migrated from PSA ArcGIS REST Service to Mapbox Boundaries v4.5:

**Changes:**
- **Data source**: PSA → Mapbox Boundaries v4.5 tileset
- **Admin level**: Uses `boundaries_admin_4` source layer (barangays)
- **Filtering**: Automatically filters to Philippines (ISO: 'PH')
- **Matching**: Updates property name extraction to use Mapbox schema (`name`, `name_en`, etc.)
- **Performance**: Vector tiles provide better performance than fetching GeoJSON

**Benefits:**
- Official Mapbox boundaries with regular updates
- Better integration with Mapbox ecosystem
- Improved performance with vector tiles
- No external API dependencies (PSA service)


## Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Mapbox Boundaries v4 Reference](https://docs.mapbox.com/data/boundaries/reference/mapbox-boundaries-v4/)
- [Mapbox Boundaries Explorer](https://demos.mapbox.com/boundaries-explorer/) - Explore available boundaries
- [React Map GL Documentation](https://visgl.github.io/react-map-gl/)
- [Mapbox Studio](https://studio.mapbox.com/) - Create custom map styles
- [Mapbox Enterprise Contact](https://www.mapbox.com/boundaries) - Request Boundaries access
