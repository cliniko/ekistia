# SAFDZ Color Reference Guide

This document provides a quick visual reference for the SAFDZ (Strategic Agriculture and Fisheries Development Zones) classification colors as implemented in the Ekistia mapping platform.

## Color Scheme

### Primary Agricultural Zones

| Code | Classification | Color (Hex) | RGB | Visual |
|------|---------------|-------------|-----|--------|
| 1 | Strategic CCP Sub-development Zone | `#90EE90` | rgb(144, 238, 144) | 🟢 Light Green |
| 2 | Strategic Livestock Sub-development Zone | `#6B46C1` | rgb(107, 70, 193) | 🟣 Dark Purple |
| 3 | Strategic Fishery Sub-development Zone | `#ADD8E6` | rgb(173, 216, 230) | 🔵 Light Blue |

### Integrated Zones

| Code | Classification | Color (Hex) | RGB | Visual |
|------|---------------|-------------|-----|--------|
| 4 | Strategic Integrated Crop/Livestock | `#98D98E` | rgb(152, 217, 142) | 🌿 Green-Yellow Mix |
| 5 | Strategic Integrated Crop/Fishery | `#9ED9CC` | rgb(158, 217, 204) | 🌊 Cyan-Green |
| 6 | Strategic Integrated Crop/Livestock/Fishery | `#B0BEC5` | rgb(176, 190, 197) | ⚪ Blue-Gray |
| 7 | Strategic Integrated Fishery and Livestock | `#8FA3C4` | rgb(143, 163, 196) | 💙 Purple-Blue |

### Protected and Public Lands

| Code | Classification | Color (Hex) | RGB | Visual |
|------|---------------|-------------|-----|--------|
| 8 | NIPAS (National Integrated Protected Areas System) | `#DDA0DD` | rgb(221, 160, 221) | 💜 Pink/Violet |
| 9 | Rangelands/PAAD | `#FFA500` | rgb(255, 165, 0) | 🟠 Orange |
| 10 | Sub-watershed/Forestry Zone | `#2F4F2F` | rgb(47, 79, 47) | 🌲 Dark Green |

### Urban and Water

| Code | Classification | Color (Hex) | RGB | Visual |
|------|---------------|-------------|-----|--------|
| BU | Built-Up Areas | `#808080` | rgb(128, 128, 128) | ⚫ Gray |
| WB | Water Bodies | `#4682B4` | rgb(70, 130, 180) | 💧 Steel Blue |
| Others | Other Classifications | `#D3D3D3` | rgb(211, 211, 211) | ⚪ Light Gray |

## Border/Outline Colors

Each classification also has a darker variant used for borders and outlines:

| Code | Primary Color | Border Color (Hex) | RGB |
|------|--------------|-------------------|-----|
| 1 | Light Green | `#32CD32` | rgb(50, 205, 50) |
| 2 | Dark Purple | `#553C9A` | rgb(85, 60, 154) |
| 3 | Light Blue | `#5F9EA0` | rgb(95, 158, 160) |
| 8 | Pink/Violet | `#BA55D3` | rgb(186, 85, 211) |
| 9 | Orange | `#FF8C00` | rgb(255, 140, 0) |
| 10 | Dark Green | `#1B371B` | rgb(27, 55, 27) |
| BU | Gray | `#505050` | rgb(80, 80, 80) |
| WB | Steel Blue | `#27496D` | rgb(39, 73, 109) |

## Usage in Code

### TypeScript/JavaScript

```typescript
import { getSafdzColor, getSafdzDarkColor, getSafdzClassification } from '@/types/safdz';

// Get the fill color for a zone
const color = getSafdzColor('1'); // Returns '#90EE90'

// Get the border color for a zone
const borderColor = getSafdzDarkColor('1'); // Returns '#32CD32'

// Get full classification details
const classification = getSafdzClassification('1');
// Returns: {
//   code: '1',
//   label: 'Strategic CCP Sub-development Zone',
//   description: 'Commercial Crop Production Zone',
//   color: '#90EE90',
//   darkColor: '#32CD32'
// }
```

### Mapbox GL JS

The colors are applied in the map layer definition using Mapbox's expression syntax:

```javascript
paint: {
  'fill-color': [
    'case',
    ['==', ['get', 'SAFDZ'], '1'], '#90EE90',  // Strategic CCP
    ['==', ['get', 'SAFDZ'], '2'], '#6B46C1',  // Strategic Livestock
    ['==', ['get', 'SAFDZ'], '3'], '#ADD8E6',  // Strategic Fishery
    // ... more classifications
    '#D3D3D3'  // Default (Others)
  ],
  'fill-opacity': 0.7
}
```

## Color Accessibility

The color scheme has been designed with the following considerations:

1. **High Contrast**: Each zone type has a distinct color that stands out from adjacent zones
2. **Color Blind Friendly**: Uses a combination of hue, saturation, and brightness variations
3. **Semantic Meaning**: 
   - Green tones = Agricultural/crop zones
   - Blue tones = Water/fishery related
   - Purple = Livestock
   - Orange = Public lands
   - Dark green = Protected forests
   - Gray = Urban development

## Legend Display

### Compact View (Hover-to-expand)
Shows small color dots with tooltips for quick reference.

### Expanded View
Shows full classification names with colored squares:
- ◼️ Strategic CCP Sub-development Zone
- ◼️ Strategic Livestock Sub-development Zone
- ◼️ Strategic Fishery Sub-development Zone
- ◼️ NIPAS
- ◼️ Rangelands/PAAD
- ◼️ Sub-watershed/Forestry Zone
- ◼️ Built-Up Areas
- ◼️ Water Bodies

## Data Source Mapping

Colors are based on official SAFDZ classifications from:
- **Agency**: DENR/DA-BSWM (Bureau of Soils and Water Management)
- **Year**: 2022
- **Source**: ILIGAN SAFDZ shapefile dataset

## Notes

- Colors are rendered with 70% opacity (`fill-opacity: 0.7`) to allow underlying features to be visible
- Borders are rendered with 80% opacity and slightly darker colors for definition
- Mixed classifications (e.g., "9 / BU") use the color of the primary classification (first code)
- The color scheme follows the official government documentation for SAFDZ mapping

