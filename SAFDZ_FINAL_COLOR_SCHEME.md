# SAFDZ Final Color Scheme

## Updated Color Palette - Optimized for Visual Appeal and Clarity

This document describes the final, refined color scheme for SAFDZ classifications with proper opacity settings and zoom-based adjustments.

### Primary Colors (Fill Layers)

| Code | Classification | Color | Hex Code | RGB | Visual |
|------|---------------|-------|----------|-----|--------|
| 1 | Strategic CCP Sub-development Zone | Lawn Green (bright) | `#7CFC00` | rgb(124, 252, 0) | 🟢 |
| 2 | Strategic Livestock Sub-development Zone | Purple (rich) | `#8B4789` | rgb(139, 71, 137) | 🟣 |
| 3 | Strategic Fishery Sub-development Zone | Sky Blue | `#87CEEB` | rgb(135, 206, 235) | 🔵 |
| 4 | Strategic Integrated Crop/Livestock | Yellow Green | `#9ACD32` | rgb(154, 205, 50) | 🌿 |
| 5 | Strategic Integrated Crop/Fishery | Medium Turquoise | `#48D1CC` | rgb(72, 209, 204) | 🌊 |
| 6 | Strategic Integrated Crop/Livestock/Fishery | Light Sea Green | `#20B2AA` | rgb(32, 178, 170) | 🟢🔵 |
| 7 | Strategic Integrated Fishery/Livestock | Royal Blue | `#4169E1` | rgb(65, 105, 225) | 💙 |
| 8 | NIPAS (Protected Areas) | Orchid | `#DA70D6` | rgb(218, 112, 214) | 💜 |
| 9 | Rangelands/PAAD | Dark Orange | `#FF8C00` | rgb(255, 140, 0) | 🟠 |
| 10 | Sub-watershed/Forestry Zone | Forest Green | `#228B22` | rgb(34, 139, 34) | 🌲 |
| BU | Built-Up Areas | Dark Gray | `#A9A9A9` | rgb(169, 169, 169) | ⚫ |
| WB | Water Bodies | Dodger Blue | `#1E90FF` | rgb(30, 144, 255) | 💧 |
| Others | Other Classifications | Gainsboro | `#DCDCDC` | rgb(220, 220, 220) | ⚪ |

### Border/Outline Colors

| Code | Classification | Border Color | Hex Code | RGB |
|------|---------------|--------------|----------|-----|
| 1 | Strategic CCP | Forest Green | `#228B22` | rgb(34, 139, 34) |
| 2 | Strategic Livestock | Indigo | `#4B0082` | rgb(75, 0, 130) |
| 3 | Strategic Fishery | Steel Blue | `#4682B4` | rgb(70, 130, 180) |
| 4 | Strategic Integrated Crop/Livestock | Olive Drab | `#6B8E23` | rgb(107, 142, 35) |
| 5 | Strategic Integrated Crop/Fishery | Dark Cyan | `#008B8B` | rgb(0, 139, 139) |
| 6 | Strategic Integrated All | Dark Slate Gray | `#2F4F4F` | rgb(47, 79, 79) |
| 7 | Strategic Fishery/Livestock | Midnight Blue | `#191970` | rgb(25, 25, 112) |
| 8 | NIPAS | Dark Magenta | `#8B008B` | rgb(139, 0, 139) |
| 9 | Rangelands/PAAD | Chocolate | `#D2691E` | rgb(210, 105, 30) |
| 10 | Sub-watershed/Forestry | Dark Green | `#006400` | rgb(0, 100, 0) |
| BU | Built-Up Areas | Dark Slate Gray | `#2F4F4F` | rgb(47, 79, 79) |
| WB | Water Bodies | Dark Blue | `#00008B` | rgb(0, 0, 139) |
| Others | Other Classifications | Dim Gray | `#696969` | rgb(105, 105, 105) |

## Dynamic Opacity Settings

### Fill Opacity (Zoom-based)
- **Zoom 10 (Far)**: 0.6 (60%) - Subtle, allows seeing terrain beneath
- **Zoom 14 (Medium)**: 0.75 (75%) - Balanced visibility
- **Zoom 18 (Close)**: 0.85 (85%) - High visibility for detailed inspection

### Outline Opacity (Zoom-based)
- **Zoom 10 (Far)**: 0.5 (50%) - Subtle boundaries
- **Zoom 14 (Medium)**: 0.7 (70%) - Clear definition
- **Zoom 18 (Close)**: 0.9 (90%) - Sharp, clear boundaries

### Line Width (Zoom-based)
- **Zoom 10 (Far)**: 0.5px - Thin, minimal visual clutter
- **Zoom 14 (Medium)**: 1.0px - Standard width
- **Zoom 18 (Close)**: 1.5px - Thicker for clarity at high zoom

## Visual Features

### 1. Smooth Anti-aliasing
- **Setting**: `fill-antialias: true`
- **Effect**: Smooth, professional-looking edges instead of pixelated
- **Benefit**: Better visual quality, especially at different zoom levels

### 2. Interpolated Properties
- All opacity and width values smoothly transition as you zoom
- No jarring jumps in appearance
- Professional, polished user experience

### 3. Color Contrast
- Bright, saturated colors for main zones
- Darker, muted colors for borders
- High contrast ensures readability at all zoom levels

## Color Design Principles

### 1. **Semantic Meaning**
- **Green tones** (🟢 #7CFC00, 🌲 #228B22): Agricultural/crop zones
- **Purple tones** (🟣 #8B4789, 💜 #DA70D6): Livestock and protected areas
- **Blue tones** (🔵 #87CEEB, 💧 #1E90FF): Water/fishery related
- **Orange** (🟠 #FF8C00): Public lands (Rangelands/PAAD)
- **Gray** (⚫ #A9A9A9): Urban development

### 2. **Visibility Optimization**
- Bright, vibrant primary colors for easy identification
- Dark borders for clear zone definition
- Sufficient contrast between adjacent zones

### 3. **Accessibility**
- Works well for color-blind users (diverse hue and brightness)
- High contrast ratios for readability
- Clear visual hierarchy

## Legend Display

### Compact View
Shows small color squares (3x3px) with tooltips for quick reference.

### Expanded View
Shows larger color squares (4x4px) with:
- Subtle ring border for definition
- Hover effect with light gray background
- Full classification names
- Smooth transitions

## Usage Notes

1. **Zoom for Details**: Zoom in to see clearer boundaries and higher opacity
2. **Mixed Classifications**: Areas with codes like "9 / BU" use the primary code's color
3. **Layer Ordering**: SAFDZ layers render on top for maximum visibility
4. **Performance**: Smooth interpolation doesn't impact rendering performance

## Implementation

Colors are implemented in Mapbox GL JS using:
```javascript
'fill-color': ['case',
  ['==', ['get', 'SAFDZ'], '1'], '#7CFC00',
  ['==', ['get', 'SAFDZ'], '2'], '#8B4789',
  // ... etc
]

'fill-opacity': [
  'interpolate', ['linear'], ['zoom'],
  10, 0.6,
  14, 0.75,
  18, 0.85
]
```

This ensures consistent, professional visualization across all zoom levels and viewing conditions.

