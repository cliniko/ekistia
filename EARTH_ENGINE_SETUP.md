# Google Earth Engine AlphaEarth Integration

This guide explains how to integrate Google Earth Engine's AlphaEarth satellite embeddings into your Ekistia agricultural mapping application.

## Overview

AlphaEarth provides 128-dimensional satellite embeddings from Google Earth Engine that can be used for advanced agricultural analysis. The integration includes 8 pre-configured layers focused on agriculture:

### Available Layers

1. **Crop Health Index** 🌾
   - Bands: A01, A16, A09
   - Shows vegetation health and crop vigor (NDVI-like)
   - Colors: Brown → Yellow → Light Green → Dark Green

2. **Agricultural Land Classification** 🌾
   - Bands: A05, A12, A23
   - Identifies agricultural areas vs. urban/forest
   - Colors: Brown → Sandy → Gold → Yellow-Green

3. **Soil Moisture Indicator** 🏞️
   - Bands: A07, A18, A11
   - Estimates soil moisture and water content
   - Colors: Dark Red → Red → Sky Blue → Navy

4. **Vegetation Type** 🌿
   - Bands: A03, A14, A21
   - Distinguishes different crop types
   - Colors: Tan → Light Green → Medium Green → Dark Green

5. **Water Bodies & Irrigation** 💧
   - Bands: A02, A08, A15
   - Detects water features and irrigation systems
   - Colors: Beige → Sky Blue → Royal Blue → Navy

6. **Crop Stress Detection** 🌾
   - Bands: A06, A13, A19
   - Identifies stressed or diseased crops
   - Colors: Green → Yellow → Orange → Red

7. **Bare Soil & Tilled Land** 🏞️
   - Bands: A04, A10, A17
   - Shows exposed soil and recently tilled land
   - Colors: Green → Tan → Brown → Dark Brown

8. **Agricultural Composite** 📊
   - Bands: A01, A05, A09
   - Multi-band composite optimized for agriculture
   - Colors: Dark → Green → Yellow → Red

## Architecture

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │
         ├─── Option 1: Backend Service ───┐
         │                                  │
         │    ┌──────────────────────┐     │
         └───→│  Node.js/Python API  │     │
              │  (with GEE Auth)     │     │
              └──────────┬───────────┘     │
                         │                 │
                    ┌────▼─────────┐       │
                    │ Google Earth │       │
                    │   Engine     │       │
                    │  REST API    │       │
                    └──────────────┘       │
                                           │
         ┌─── Option 2: Pre-computed ─────┘
         │
         │    ┌──────────────────────┐
         └───→│  Tile Server         │
              │  (Pre-rendered PNG)  │
              └──────────────────────┘
```

## Setup Options

### Option 1: Backend Service (Recommended)

This approach uses a backend service to authenticate with Google Earth Engine and generate tile URLs dynamically.

#### 1.1 Set up Google Earth Engine

1. Sign up for Google Earth Engine at [https://earthengine.google.com/](https://earthengine.google.com/)
2. Request access (usually approved within 24 hours)
3. Create a Google Cloud Project
4. Enable Earth Engine API
5. Create a service account and download the JSON key

#### 1.2 Create Backend Service

**Node.js Example:**

```javascript
// backend/server.js
const express = require('express');
const ee = require('@google/earthengine');
const privateKey = require('./earth-engine-key.json');

const app = express();
app.use(express.json());

// Initialize Earth Engine
ee.data.authenticateViaPrivateKey(
  privateKey,
  () => {
    ee.initialize(null, null, () => {
      console.log('Earth Engine initialized');
    });
  },
  (err) => {
    console.error('EE authentication failed:', err);
  }
);

// Generate tile URL endpoint
app.post('/api/earth-engine/generate-tiles', async (req, res) => {
  try {
    const { dataset, dateRange, bounds, bands, visualization } = req.body;

    // Load AlphaEarth dataset
    const collection = ee.ImageCollection(dataset);
    const point = ee.Geometry.Point([bounds.lng, bounds.lat]);

    // Filter by date and location
    const image = collection
      .filterDate(dateRange[0], dateRange[1])
      .filterBounds(point)
      .first();

    // Select bands
    const selectedBands = image.select(bands);

    // Apply visualization
    const visualized = selectedBands.visualize({
      min: visualization.min,
      max: visualization.max,
      palette: visualization.palette
    });

    // Get map tiles
    const mapId = await new Promise((resolve, reject) => {
      visualized.getMap({}, (obj, err) => {
        if (err) reject(err);
        else resolve(obj);
      });
    });

    res.json({
      urlTemplate: mapId.urlFormat,
      mapId: mapId.mapid
    });
  } catch (error) {
    console.error('Error generating tiles:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Earth Engine backend running on port 3001');
});
```

**Python Example (Flask):**

```python
# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import ee
import json

app = Flask(__name__)
CORS(app)

# Initialize Earth Engine
with open('earth-engine-key.json') as f:
    service_account_info = json.load(f)

credentials = ee.ServiceAccountCredentials(
    service_account_info['client_email'],
    'earth-engine-key.json'
)
ee.Initialize(credentials)

@app.route('/api/earth-engine/generate-tiles', methods=['POST'])
def generate_tiles():
    try:
        data = request.json
        dataset = data['dataset']
        date_range = data['dateRange']
        bounds = data['bounds']
        bands = data['bands']
        visualization = data['visualization']

        # Load AlphaEarth dataset
        collection = ee.ImageCollection(dataset)
        point = ee.Geometry.Point([bounds['lng'], bounds['lat']])

        # Filter by date and location
        image = collection \
            .filterDate(date_range[0], date_range[1]) \
            .filterBounds(point) \
            .first()

        # Select bands
        selected_bands = image.select(bands)

        # Apply visualization
        visualized = selected_bands.visualize(
            min=visualization['min'],
            max=visualization['max'],
            palette=visualization['palette']
        )

        # Get map tiles
        map_id = visualized.getMapId()

        return jsonify({
            'urlTemplate': map_id['tile_fetcher'].url_format,
            'mapId': map_id['mapid']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)
```

#### 1.3 Configure Frontend

Add to your `.env` file:

```bash
VITE_EE_BACKEND_URL=http://localhost:3001/api/earth-engine
```

### Option 2: Pre-computed Tiles

This approach pre-renders tiles and serves them as static files.

#### 2.1 Generate Tiles

Use Earth Engine Code Editor or Python script to export tiles:

```javascript
// Earth Engine Code Editor Script
var dataset = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL');
var iligan = ee.Geometry.Point([124.2453, 8.2280]);

var alphaEarth = dataset
    .filterDate('2024-01-01', '2024-12-31')
    .filterBounds(iligan)
    .first();

// For each layer configuration
var cropHealth = alphaEarth.select(['A01', 'A16', 'A09']);
var visualization = cropHealth.visualize({
    min: -0.3,
    max: 0.3,
    palette: ['#8B4513', '#FFFF00', '#90EE90', '#006400']
});

// Export to Cloud Storage or Drive
Export.map.toCloudStorage({
    image: visualization,
    description: 'alphaearth_crop_health',
    bucket: 'your-bucket-name',
    fileFormat: 'png',
    path: 'alphaearth/crop-health/',
    minZoom: 8,
    maxZoom: 18,
    region: iligan.buffer(50000) // 50km radius around Iligan
});
```

#### 2.2 Set up Tile Server

Serve the pre-rendered tiles using any static file server or CDN:

- AWS S3 + CloudFront
- Google Cloud Storage + CDN
- Azure Blob Storage + CDN
- Simple HTTP server (nginx, Apache)

#### 2.3 Configure Frontend

Add to your `.env` file:

```bash
VITE_TILE_SERVER_URL=https://your-cdn.com/tiles
```

Tiles should follow this structure:
```
https://your-cdn.com/tiles/alphaearth/{layerId}/{z}/{x}/{y}.png
```

## Usage

Once configured, the AlphaEarth layers will be available in your map interface:

1. Click the "AlphaEarth Layers" button in the top-right corner
2. Select a category filter (Crops, Vegetation, Soil, Water, or All)
3. Check the layers you want to display
4. Adjust the opacity slider for better visualization
5. Layers will overlay on your 3D agricultural map

## Layer Configuration

You can customize layer configurations in `src/services/earthEngineService.ts`:

```typescript
{
  id: 'custom-layer',
  name: 'Custom Agricultural Layer',
  description: 'Your custom layer description',
  bands: ['A01', 'A05', 'A09'], // Choose from A00-A127
  visualization: {
    min: -0.4,
    max: 0.4,
    palette: ['#color1', '#color2', '#color3', '#color4']
  },
  category: 'crops' // crops, vegetation, soil, water, or general
}
```

## Band Selection Guide

AlphaEarth provides 128 bands (A00-A127). Here are some general guidelines:

- **A00-A15**: General spectral features, vegetation indices
- **A16-A31**: Land cover and land use discrimination
- **A32-A47**: Seasonal patterns and phenology
- **A48-A63**: Water features and moisture
- **A64-A79**: Urban and built-up areas
- **A80-A95**: Soil and bare earth
- **A96-A111**: Texture and spatial patterns
- **A112-A127**: Advanced composite features

Experiment with different band combinations to find what works best for your specific agricultural analysis needs.

## Troubleshooting

### Backend Service Issues

**Error: "EE authentication failed"**
- Verify your service account JSON key is correct
- Ensure Earth Engine API is enabled in Google Cloud Console
- Check that the service account has Earth Engine access

**Error: "Dataset not available"**
- Confirm you have access to the AlphaEarth dataset
- Some datasets require special permissions

### Tile Loading Issues

**Tiles not appearing on map**
- Check browser console for errors
- Verify tile URLs are correct (Network tab)
- Ensure CORS is properly configured on backend/tile server
- Check that zoom levels match your tile availability

**Slow tile loading**
- Consider pre-computing tiles (Option 2)
- Use a CDN for faster delivery
- Reduce the number of active layers

## Performance Tips

1. **Limit Active Layers**: Display only 1-2 layers at a time for best performance
2. **Use Appropriate Zoom Levels**: Configure minzoom/maxzoom based on your tile availability
3. **Cache Tiles**: Implement tile caching on backend or use CDN
4. **Optimize Band Selection**: Some band combinations compute faster than others

## Cost Considerations

- **Earth Engine**: Free for non-commercial use, paid for commercial
- **Tile Storage**: S3/GCS storage costs if using pre-computed tiles
- **CDN Bandwidth**: Data transfer costs for serving tiles
- **Backend Hosting**: Server costs if using dynamic tile generation

## Resources

- [Google Earth Engine Documentation](https://developers.google.com/earth-engine)
- [AlphaEarth Dataset](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_SATELLITE_EMBEDDING_V1_ANNUAL)
- [Earth Engine Python API](https://developers.google.com/earth-engine/guides/python_install)
- [Earth Engine Node.js API](https://github.com/google/earthengine-api/tree/master/javascript)
- [Mapbox Raster Layers](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#raster)

## License

Ensure compliance with:
- Google Earth Engine Terms of Service
- AlphaEarth dataset license
- Mapbox Terms of Service
