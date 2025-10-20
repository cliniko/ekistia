# SAFDZ Data Analysis and Implementation

## Overview

This document describes the analysis and implementation of the Strategic Agriculture and Fisheries Development Zones (SAFDZ) data for the Ekistia mapping platform.

## Data Source

**Original Data**: ILIGAN SAFDZ shapefile from DENR/DA-BSWM (Bureau of Soils and Water Management)
- **Location**: `src/data/safdz and npaaad/ILIGAN SAFDZ/`
- **Format**: Shapefile (.shp, .shx, .dbf, .prj)
- **Coordinate System**: PRS 1992 UTM Zone 51N
- **Total Features**: 10,412 features

**Converted Data**: `public/iligan_safdz.geojson`
- **Format**: GeoJSON (Web-compatible)
- **Coordinate System**: WGS84 (EPSG:4326)

## SAFDZ Classifications

The SAFDZ data contains 11 primary land classification zones as defined by the government:

### 1. Strategic CCP Sub-development Zone (Code: 1)
- **Description**: Commercial Crop Production Zone
- **Color**: Light Green (#90EE90)
- **Features**: 253 polygons
- **Purpose**: Areas designated for high-value commercial crop production

### 2. Strategic Livestock Sub-development Zone (Code: 2)
- **Description**: Livestock Production Zone
- **Color**: Dark Purple (#6B46C1)
- **Features**: 850 polygons
- **Purpose**: Areas designated for livestock raising and production

### 3. Strategic Fishery Sub-development Zone (Code: 3)
- **Description**: Fishery Production Zone
- **Color**: Light Blue (#ADD8E6)
- **Features**: 9 polygons
- **Purpose**: Areas designated for aquaculture and fishery production

### 4-7. Strategic Integrated Zones (Codes: 4-7)
- **4**: Integrated Crop/Livestock Sub-development Zone
- **5**: Integrated Crop/Fishery Sub-development Zone
- **6**: Integrated Crop/Livestock/Fishery Sub-development Zone
- **7**: Integrated Fishery and Livestock Sub-development Zone
- **Purpose**: Areas for mixed agricultural activities

### 8. NIPAS (Code: 8)
- **Description**: National Integrated Protected Areas System
- **Color**: Pink/Violet (#DDA0DD)
- **Features**: 1,545 polygons
- **Purpose**: Protected areas for biodiversity conservation

### 9. Rangelands/PAAD (Code: 9)
- **Description**: Rangelands/Public Alienable and Disposable
- **Color**: Orange (#FFA500)
- **Features**: 4,089 polygons (largest category)
- **Purpose**: Public lands available for agricultural development

### 10. Sub-watershed/Forestry Zone (Code: 10)
- **Description**: Sub-watershed and Forest Protection Zone
- **Color**: Dark Green (#2F4F2F)
- **Features**: 1,113 polygons
- **Purpose**: Forest areas and watershed protection zones

### 11. Built-Up Areas (Code: BU)
- **Description**: Urban and Built-Up Areas
- **Color**: Gray (#808080)
- **Features**: 1,808 polygons
- **Purpose**: Developed urban, residential, and commercial areas

### Additional Classifications

- **Water Bodies (Code: WB)**
  - **Color**: Steel Blue (#4682B4)
  - **Features**: 466 polygons
  - **Purpose**: Rivers, lakes, and other water bodies

- **Others (Code: Others)**
  - **Color**: Light Gray (#D3D3D3)
  - **Features**: 99 polygons
  - **Purpose**: Miscellaneous or unclassified areas

### Mixed Classifications
Some areas have mixed classifications (e.g., "9 / BU", "10 / BU"), indicating zones with dual purposes or transition areas. The map visualization prioritizes the primary classification (the first code before the slash).

## Data Statistics

| Classification | Code | Features | Percentage |
|---------------|------|----------|------------|
| Rangelands/PAAD | 9 | 4,089 | 39.3% |
| Built-Up Areas | BU | 1,808 | 17.4% |
| NIPAS | 8 | 1,545 | 14.8% |
| Sub-watershed/Forestry | 10 | 1,113 | 10.7% |
| Strategic Livestock | 2 | 850 | 8.2% |
| Water Bodies | WB | 466 | 4.5% |
| Strategic CCP | 1 | 253 | 2.4% |
| Others | Others | 99 | 1.0% |
| Mixed Classifications | Various | 180 | 1.7% |
| Strategic Fishery | 3 | 9 | 0.1% |

## Implementation Details

### Files Created/Modified

1. **`src/types/safdz.ts`** - NEW
   - SAFDZ classification definitions
   - Color mappings for each zone type
   - Utility functions for color retrieval

2. **`src/components/AgriculturalMapView3D.tsx`** - MODIFIED
   - Updated to use SAFDZ field instead of LMU_CODE
   - Applied official SAFDZ colors
   - Updated legend with SAFDZ classifications

3. **`src/services/safdzDataService.ts`** - MODIFIED
   - Updated to load `iligan_safdz.geojson` instead of `safdz_agri_barangays.geojson`

4. **`public/iligan_safdz.geojson`** - NEW
   - Converted shapefile data in web-compatible GeoJSON format
   - 10,412 features with SAFDZ classifications

5. **`scripts/convert_safdz_shapefile.py`** - NEW
   - Python script for converting shapefiles to GeoJSON using GeoPandas
   - Handles coordinate system reprojection

### Color Scheme

The color scheme follows the official SAFDZ classification guidelines:
- **Green tones**: Agricultural zones (light green for crops)
- **Purple**: Livestock zones
- **Blue tones**: Fishery and water-related zones
- **Orange**: Public alienable and disposable lands
- **Dark green**: Forest and watershed protection
- **Pink/Violet**: Protected areas (NIPAS)
- **Gray**: Urban/built-up areas
- **Steel blue**: Water bodies

### Technical Features

1. **Coordinate Reprojection**: Data automatically reprojected from PRS 1992 UTM to WGS84 for web mapping
2. **Efficient Rendering**: Uses Mapbox GL JS with optimized rendering for 10,000+ polygons
3. **Interactive Legend**: 
   - Compact view shows color dots with tooltips
   - Expanded view shows full classification details
   - Toggle visibility of SAFDZ layer
4. **Mixed Classification Handling**: Automatically prioritizes primary classification in mixed zones
5. **3D Visualization**: Integrated with 3D terrain and building rendering

## Usage

The SAFDZ layer is automatically loaded when accessing the agricultural map view. Users can:
- View different SAFDZ classifications with color-coded zones
- Toggle SAFDZ layer visibility using the legend controls
- Hover over zones to see classification details
- Combine SAFDZ data with hazard layers (flood, landslide, slope, etc.)

## Data Quality Notes

- The shapefile contains some features with mixed classifications (e.g., "9 / BU")
- Empty SAFDZ values are classified as "Others"
- All geometries have been validated and reprojected successfully
- No data loss during conversion from shapefile to GeoJSON

## References

- **Agency**: ALMED_BSWM (Agricultural Land Management and Evaluation Division - Bureau of Soils and Water Management)
- **Approved by**: Gina P. Nilo, Ph.D. (Director)
- **Prepared by**: Engr. John Algen B. Mendez
- **Year**: 2022

## Future Enhancements

Potential future improvements:
1. Add filtering by specific SAFDZ classifications
2. Implement area calculations per classification
3. Add export functionality for SAFDZ statistics
4. Integrate with crop suitability analysis
5. Add comparison tools for different zones

