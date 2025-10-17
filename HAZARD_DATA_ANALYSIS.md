# Hazard Data Analysis - Iligan City

## Dataset Overview

### 1. **Flood Hazard Zones** (`iligan_flood_hazard.geojson`)
- **Features**: 830 polygons
- **Size**: 15MB
- **Geometry**: Polygon
- **Last Updated**: 2021

**Flood Susceptibility Levels:**
- `VHF` - Very High Flood (10 zones) - 1.2%
- `HF` - High Flood (318 zones) - 38.3%
- `MF` - Medium Flood (343 zones) - 41.3%
- `LF` - Low Flood (159 zones) - 19.2%

**Key Properties:**
- `FloodSusc`: Flood susceptibility level
- `Shape_Area`: Area in square meters
- `Shape_Leng`: Perimeter length in meters
- `Updated`: Year of last update

**Color Scheme Recommendation:**
- VHF: `#7f1d1d` (Dark Red)
- HF: `#dc2626` (Red)
- MF: `#f59e0b` (Orange)
- LF: `#10b981` (Green)

---

### 2. **Landslide Hazard Zones** (`iligan_landslide_hazard.geojson`)
- **Features**: 1,353 polygons
- **Size**: 34MB (largest file)
- **Geometry**: Polygon
- **Last Updated**: 2021

**Landslide Susceptibility Levels:**
- `VHL` - Very High Landslide (125 zones) - 9.2%
- `HL` - High Landslide (304 zones) - 22.5%
- `ML` - Medium Landslide (648 zones) - 47.9%
- `LL` - Low Landslide (156 zones) - 11.5%
- `DF` - Debris Flow (120 zones) - 8.9%

**Key Properties:**
- `LndslideSu`: Landslide susceptibility level
- `Shape_Area`: Area in square meters
- `Shape_Leng`: Perimeter length in meters

**Color Scheme Recommendation:**
- VHL: `#7f1d1d` (Dark Red)
- HL: `#dc2626` (Red)
- ML: `#f59e0b` (Orange)
- LL: `#10b981` (Green)
- DF: `#a855f7` (Purple - special case)

---

### 3. **Slope Analysis** (`iligan_slope.geojson`)
- **Features**: 64 polygons
- **Size**: 498KB
- **Geometry**: Polygon

**Slope Categories:**
- `0-3%` - Nearly Level
- `3-8%` - Very Gently Sloping
- `8-18%` - Undulating to Rolling
- `18-30%` - Rolling to Moderately Steep
- `31-50%` - Steep
- `50% and above` - Very Steep

**Key Properties:**
- `SLOPE`: Slope percentage range
- `DESCRIPT`: Slope description
- `AREA`: Area coverage
- `Shape_Area`: Area in square meters

**Color Scheme Recommendation:**
- 0-3%: `#10b981` (Green)
- 3-8%: `#84cc16` (Light Green)
- 8-18%: `#eab308` (Yellow)
- 18-30%: `#f97316` (Orange)
- 31-50%: `#dc2626` (Red)
- 50%+: `#7f1d1d` (Dark Red)

---

### 4. **Land Use Classification** (`iligan_landuse.geojson`)
- **Features**: 125 polygons
- **Size**: 382KB
- **Geometry**: Polygon

**Land Use Types (5 categories):**
1. Proposed Growth Area
2. Forestland
3. Agriculture
4. Mineral Extraction
5. Urban

**Key Properties:**
- `LANDUSE`: Land use classification
- `BRGY`: Barangay name
- `CLASS`: Urban/Rural classification
- `CLASSIFICA`: Coastal/Upland classification
- `HECTARES`: Area in hectares
- `LandClass`: A&D (Alienable & Disposable) classification

**Color Scheme Recommendation:**
- Proposed Growth Area: `#3b82f6` (Blue)
- Forestland: `#16a34a` (Forest Green)
- Agriculture: `#84cc16` (Lime Green)
- Mineral Extraction: `#a855f7` (Purple)
- Urban: `#ef4444` (Red)

---

### 5. **Ancestral Domain** (`iligan_ancestral_domain.geojson`)
- **Features**: 1 polygon
- **Size**: 2KB
- **Geometry**: Polygon
- **Area**: 32,849.2 square meters (3.28 hectares)

**Key Properties:**
- `Id`: Domain identifier
- `area`: Area in square meters

**Color Scheme Recommendation:**
- Ancestral Domain: `#8b5cf6` (Purple with pattern)

---

## Data Quality Assessment

### Coverage Analysis
- **Total Polygons**: 2,373 features
- **Total Data Size**: ~50MB
- **Geographic Extent**: Iligan City bounds
- **Coordinate System**: WGS84 (after conversion)

### Data Currency
- **Flood & Landslide**: Updated 2021
- **Slope & Land Use**: 2025 data
- **Recommendation**: Flood and landslide data may need updating

### Performance Considerations
1. **Landslide data (34MB)** - Largest file, may need:
   - Progressive loading
   - Zoom-level based rendering
   - Simplification for distant zoom levels

2. **Flood data (15MB)** - Moderate size, consider:
   - Caching strategy
   - Lazy loading when layer is toggled

3. **Other datasets** - Small enough for immediate loading

---

## Integration Recommendations

### Layer Priority (Z-Index)
1. Ancestral Domain (overlay, semi-transparent)
2. Flood Zones (important, semi-transparent)
3. Landslide Zones (important, semi-transparent)
4. Slope Analysis (base layer)
5. Land Use (base layer, lower priority)

### Visibility Settings
- **Default**: All layers OFF (user must enable)
- **Recommended**: Show flood and landslide by default
- **Opacity**: 0.4-0.6 for overlays

### Filter Options
For each layer, provide filters for:
1. **Flood**: Filter by susceptibility level (VHF, HF, MF, LF)
2. **Landslide**: Filter by susceptibility level (VHL, HL, ML, LL, DF)
3. **Slope**: Filter by slope range
4. **Land Use**: Filter by type and barangay
5. **Combined**: Filter by barangay across all layers

### User Interface
```
Hazard Layers Panel:
├── Flood Zones (🌊)
│   ├── Very High (10)
│   ├── High (318)
│   ├── Medium (343)
│   └── Low (159)
├── Landslide Zones (🏔️)
│   ├── Very High (125)
│   ├── High (304)
│   ├── Medium (648)
│   ├── Low (156)
│   └── Debris Flow (120)
├── Slope Analysis (📐)
├── Land Use (🏗️)
└── Ancestral Domain (🏞️)
```

---

## Agricultural Impact Analysis

### High-Risk Agricultural Areas
Overlay SAFDZ zones with hazard data to identify:

1. **Agricultural zones in flood-prone areas**
   - Priority: Protect agricultural investments
   - Action: Drainage improvement, flood barriers

2. **Agricultural zones on steep slopes**
   - Priority: Soil erosion prevention
   - Action: Terracing, contour farming

3. **Agricultural zones in landslide-prone areas**
   - Priority: Risk mitigation
   - Action: Avoid development, monitoring

### Risk Score Calculation
For each SAFDZ zone, calculate composite risk:
```javascript
riskScore = 
  (floodLevel * 0.35) + 
  (landslideLevel * 0.35) + 
  (slopeRisk * 0.20) + 
  (otherFactors * 0.10)
```

---

## Technical Implementation

### File Structure
```
public/
├── iligan_flood_hazard.geojson (15MB)
├── iligan_landslide_hazard.geojson (34MB)
├── iligan_slope.geojson (498KB)
├── iligan_landuse.geojson (382KB)
└── iligan_ancestral_domain.geojson (2KB)
```

### Loading Strategy
```javascript
// Priority loading
1. Load SAFDZ first (critical)
2. Load small hazard layers (slope, landuse, ancestral)
3. Load large hazard layers (flood, landslide) on demand
4. Cache all layers in memory
```

### Mapbox Layer Configuration
```javascript
{
  'flood-fill': {
    type: 'fill',
    minzoom: 10,
    paint: {
      'fill-color': ['match', ['get', 'FloodSusc'],
        'VHF', '#7f1d1d',
        'HF', '#dc2626',
        'MF', '#f59e0b',
        'LF', '#10b981',
        '#6b7280'
      ],
      'fill-opacity': 0.4
    }
  }
}
```

---

## Validation & Testing

### Data Validation Checklist
- [x] All GeoJSON files valid
- [x] Coordinate system is WGS84
- [x] No missing required properties
- [x] Geometries are valid polygons
- [x] Feature counts verified

### Integration Testing
- [ ] All layers load successfully
- [ ] No performance degradation
- [ ] Filters work correctly
- [ ] Click interactions functional
- [ ] Mobile responsive
- [ ] Layer toggle works
- [ ] Opacity control works

---

## Next Steps

1. **Integrate hazard layers** into AgriculturalMapView3D
2. **Create hazard layer control** UI component
3. **Add risk analysis** for SAFDZ zones
4. **Implement filtering** by hazard levels
5. **Add tooltips/popups** with hazard information
6. **Create analytics dashboard** showing hazard statistics
7. **Generate reports** on high-risk agricultural areas

