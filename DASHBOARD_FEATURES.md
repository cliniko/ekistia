# Ekistia Dashboard Features

## Overview

The Ekistia agricultural mapping platform now includes comprehensive dashboard and analysis features that provide real-time insights into Iligan City's agricultural landscape.

## New Features

### 1. Map Analytics Dashboard

**Location:** Top-left corner of the map

**Features:**
- **Coverage Area Information**: Displays the geographic scope (Iligan City and surrounding municipalities)
- **Key Statistics**:
  - Available Land: Total hectares available for agricultural development
  - Active Demands: Number of land acquisition requests
  - Matched Area: Overlap between LGU priorities, farmer supply, and business demand
  - Priority Zones: Number of barangays designated as priority areas
  - Total Agricultural Area: Complete agricultural footprint with utilization percentage

- **Crop Suitability Summary**: Breakdown by crop type showing:
  - Highly suitable areas (hectares)
  - Visual distribution bars (green = highly suitable, yellow = moderately suitable)
  - Number of barangays for each crop

- **Visible Areas**: List of 13 major barangays currently in view

- **Key Features Legend**:
  - Green patches = Agricultural/available land
  - Purple zones = Matched investment areas
  - Terrain visualization
  - Coastal areas (Iligan Bay)
  - Mountainous regions (high-value crop areas)
  - Urban center markers

**Usage:**
- Click to expand/collapse
- Compact view shows summary: "16,830 ha available • 38 demands"
- Expanded view shows full analytics

### 2. Location Analysis Panel

**Location:** Bottom-center of the map (appears on click)

**Triggered By:** Clicking on any barangay on the map

**Information Displayed:**
- **Coordinates**: Exact lat/lng of clicked location
- **Barangay Details**:
  - Name and total area
  - Agricultural area
  - Available land for development
  - Active demand requests
  - Priority zone status
  - Matched area (if applicable)

- **Crop Suitability Analysis**:
  - Individual crop assessments with color-coded badges
  - Suitability levels: Highly Suitable, Moderately Suitable, Low Suitable, Not Suitable
  - Suitable area in hectares for each crop
  - Percentage of agricultural area
  - Visual progress bars

- **Actions**:
  - "Add to Active Demands" button
  - Close button to dismiss panel

**Crop Icons:**
- 🌾 Rice
- 🌽 Corn
- 🥥 Coconut
- 🍫 Cacao
- 🍌 Banana
- 🥭 Mango

### 3. AlphaEarth Satellite Layer Integration

**Location:** Top-right corner of the map

**8 Agricultural Layers Available:**

1. **Crop Health Index** (Bands: A01, A16, A09)
   - NDVI-like vegetation health
   - Colors: Brown → Yellow → Light Green → Dark Green

2. **Agricultural Land Classification** (Bands: A05, A12, A23)
   - Farm vs. urban/forest distinction
   - Colors: Brown → Sandy → Gold → Yellow-Green

3. **Soil Moisture Indicator** (Bands: A07, A18, A11)
   - Water content estimation
   - Colors: Dark Red → Red → Sky Blue → Navy

4. **Vegetation Type** (Bands: A03, A14, A21)
   - Crop type discrimination
   - Colors: Tan → Light Green → Medium Green → Dark Green

5. **Water Bodies & Irrigation** (Bands: A02, A08, A15)
   - Water feature detection
   - Colors: Beige → Sky Blue → Royal Blue → Navy

6. **Crop Stress Detection** (Bands: A06, A13, A19)
   - Disease/stress identification
   - Colors: Green → Yellow → Orange → Red

7. **Bare Soil & Tilled Land** (Bands: A04, A10, A17)
   - Exposed soil detection
   - Colors: Green → Tan → Brown → Dark Brown

8. **Agricultural Composite** (Bands: A01, A05, A09)
   - Multi-band general view
   - Colors: Dark → Green → Yellow → Red

**Layer Controls:**
- Category filters: 🌾 Crops, 🌿 Vegetation, 🏞️ Soil, 💧 Water, 📊 General
- Opacity slider (0-100%)
- Individual layer checkboxes
- Band information display
- Color palette preview on hover

## Current Map Analysis Data

### Coverage Statistics (Iligan City Area)

```
Coverage Area: Iligan City and surrounding municipalities (Northern Mindanao)
Total Available Land: 16,830 hectares
Active Demands: 38 requests
Total Agricultural Area: Varies by barangay
Priority Zones: 5 barangays
Matched Areas: 4,600 hectares
```

### Visible Barangays (Top 13 by Agricultural Area)

1. Rogongon (19,642 ha agricultural)
2. Panoroganan (8,916 ha agricultural)
3. Mainit (2,956 ha agricultural)
4. Kalilangan (2,592 ha agricultural)
5. Dulag (1,154 ha agricultural)
6. Buru-un (747 ha agricultural)
7. Abuno (420 ha agricultural)
8. Bunawan (366 ha agricultural)
9. Dalipuga (202 ha agricultural)
10. Bonbonon (151 ha agricultural)
11. (Additional barangays as configured)

### Crop Suitability Distribution

**Rice:**
- Highly Suitable: ~10,012 ha across Bunawan, Panoroganan, Kalilangan
- Key Areas: Flat, water-accessible lowlands

**Corn:**
- Highly Suitable: ~4,180 ha across Bunawan, Panoroganan, Kalilangan
- Key Areas: Well-drained upland areas

**Coconut:**
- Highly Suitable: ~6,358 ha across Buru-un, Mainit, Rogongon
- Key Areas: Coastal and mid-elevation zones

**Cacao:**
- Highly Suitable: ~7,166 ha across Abuno, Bonbonon, Rogongon, Mainit, Dulag
- Key Areas: Shaded, mid-elevation regions

**Banana:**
- Highly Suitable: ~5,297 ha across Abuno, Buru-un, Rogongon, Dulag
- Key Areas: Well-drained, high-moisture areas

**Mango:**
- Highly Suitable: Varies by barangay
- Key Areas: Upland, well-drained locations

## Google Earth Engine Integration

### Running the Crop Suitability Analysis

1. **Open Earth Engine Code Editor**: https://code.earthengine.google.com/

2. **Load the Script**: Copy from `src/services/earthEngineScripts/iliganCropSuitability.js`

3. **Run the Script**: This will:
   - Load AlphaEarth 2024 dataset
   - Filter to Iligan City area (124.10-124.50 lng, 8.05-8.45 lat)
   - Generate 8 suitability layers
   - Calculate area statistics
   - Queue exports to Google Drive

4. **Export the Layers**: Click "Tasks" tab and run:
   - Ekistia_Rice_Suitability
   - Ekistia_Corn_Suitability
   - Ekistia_Coconut_Suitability
   - Ekistia_Cacao_Suitability
   - Ekistia_Banana_Suitability
   - Ekistia_Mango_Suitability
   - Ekistia_Current_Crops_2024
   - Ekistia_Investment_Priority

5. **Process GeoTIFF Files**:
   - Download from Google Drive
   - Upload to Mapbox Studio as tilesets
   - Note the tileset IDs

6. **Configure Ekistia**:
   ```bash
   # Option 1: Backend service
   VITE_EE_BACKEND_URL=https://your-backend.com/api/earth-engine

   # Option 2: Tile server
   VITE_TILE_SERVER_URL=https://your-cdn.com/tiles
   ```

### Band Selection for Each Crop

**Rice** (A01, A05, A09, A15, A21):
- A01: Vegetation vigor (25%)
- A05: Biomass (25%)
- A09: Moisture sensitivity (20%)
- A15: Water access (20%)
- A21: Soil texture (10%)

**Corn** (A01, A03, A10, A16, A25):
- A01: Vegetation (20%)
- A03: Growth pattern (25%)
- A10: Biomass structure (20%)
- A16: Row texture (20%)
- A25: Soil conditions (15%)

**Coconut** (A01, A16, A20, A32, A40):
- A01: Perennial vegetation (15%)
- A16: Tree structure (25%)
- A20: Canopy pattern (25%)
- A32: Spacing/texture (20%)
- A40: Long-term stability (15%)

**Cacao** (A10, A16, A25, A32, A48):
- A10: Elevation signature (20%)
- A16: Slope texture (25%)
- A25: Soil quality (20%)
- A32: Microclimate (20%)
- A48: Tree crop pattern (15%)

**Banana** (A01, A05, A09, A15, A20):
- A01: Vegetation vigor (25%)
- A05: Biomass (25%)
- A09: Moisture (20%)
- A15: Water access (20%)
- A20: Canopy pattern (10%)

**Mango** (A03, A16, A25, A32, A40):
- A03: Growth pattern (20%)
- A16: Tree structure (25%)
- A25: Soil conditions (25%)
- A32: Spacing (15%)
- A40: Perennial stability (15%)

## User Workflows

### Workflow 1: Exploring Agricultural Opportunities

1. Open Ekistia map
2. Click "Map Analysis" (top-left) to see overview statistics
3. Review crop suitability summary
4. Enable AlphaEarth layers (top-right) for specific crops of interest
5. Click on highlighted green areas to view detailed analysis
6. Review barangay-specific suitability scores
7. Click "Add to Active Demands" to register interest

### Workflow 2: Investment Decision Making

1. Open Map Analysis dashboard
2. Identify barangays with high matched areas (purple zones)
3. Enable "Investment Priority Zones" AlphaEarth layer
4. Click on priority zones to view details
5. Review crop suitability for target crops
6. Check available land vs. active demands
7. Make informed investment decisions

### Workflow 3: Agricultural Planning

1. Select specific crop from crop filter
2. Map colors update to show suitability for that crop
3. Enable crop-specific AlphaEarth layers (e.g., "Crop Health Index" for rice)
4. Click on highly suitable areas (green)
5. Review detailed suitability metrics
6. Enable "Soil Moisture" or "Water Bodies" layers for additional context
7. Plan crop placement and irrigation needs

## Technical Implementation

### Component Structure

```
AgriculturalMapView3D
├── MapAnalyticsDashboard (top-left)
│   ├── Coverage area info
│   ├── Statistics cards
│   ├── Crop suitability summary
│   └── Visible areas list
│
├── AlphaEarthLayerControl (top-right)
│   ├── Layer checklist
│   ├── Category filters
│   ├── Opacity slider
│   └── Band information
│
├── LocationAnalysisPanel (bottom-center, on click)
│   ├── Coordinates display
│   ├── Barangay information
│   ├── Crop suitability details
│   └── Action buttons
│
└── Map Legend (bottom-right)
    └── Suitability color guide
```

### Data Flow

```
Barangay Data (barangayData.ts)
    ↓
Agricultural Map View
    ↓
    ├── MapAnalyticsDashboard (aggregate statistics)
    ├── AlphaEarth Service (tile URLs)
    └── Location Analysis (click handler)
```

### Customization

**Adding New Crops:**
1. Update `src/types/agricultural.ts` with new crop type
2. Add crop data to `src/data/barangayData.ts`
3. Create Earth Engine layer in `iliganCropSuitability.js`
4. Add crop icon to `LocationAnalysisPanel.tsx`

**Modifying AlphaEarth Layers:**
1. Edit `src/services/earthEngineService.ts`
2. Update band combinations and visualizations
3. Adjust color palettes as needed

## Best Practices

1. **Layer Management**: Only enable 1-2 AlphaEarth layers at a time for performance
2. **Data Updates**: Re-run Earth Engine scripts seasonally for updated crop data
3. **User Education**: Use the info tooltips to educate users about AlphaEarth capabilities
4. **Mobile Experience**: Dashboard components are responsive but work best on desktop
5. **Data Validation**: Cross-reference AlphaEarth data with ground truth when possible

## Future Enhancements

- [ ] Time series analysis (seasonal crop changes)
- [ ] Automated crop detection using ML
- [ ] Real-time crop health monitoring
- [ ] Integration with weather data
- [ ] Farmer feedback integration
- [ ] Mobile app with offline capabilities
- [ ] Export analysis reports to PDF
- [ ] Comparison tool for multiple barangays

## Resources

- [Earth Engine Script Documentation](./EARTH_ENGINE_SETUP.md)
- [AlphaEarth Dataset](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_SATELLITE_EMBEDDING_V1_ANNUAL)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- [React Map GL](https://visgl.github.io/react-map-gl/)
