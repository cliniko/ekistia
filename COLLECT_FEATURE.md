# Collect Feature Documentation

The Collect feature allows you to upload GeoJSON data to Mapbox using either the Datasets API or the Uploads API (for tilesets). This enables you to programmatically manage map data and integrate it with your Mapbox styles.

## Features

### Upload Methods

#### 1. Dataset API
- **Best for:** Frequently updated data, real-time data collection
- **Advantages:**
  - Features are immediately available
  - Individual feature updates
  - Easy to query and modify
- **Limitations:**
  - 40 writes/minute rate limit
  - Features cannot exceed 1023 KB
- **Use cases:**
  - Real-time data collection
  - Crowdsourced data
  - Dynamic feature updates

#### 2. Tileset API (via Uploads)
- **Best for:** Static data, large datasets, optimized rendering
- **Advantages:**
  - Optimized for fast rendering
  - Supports large datasets (up to 1 GB GeoJSON)
  - Better performance for complex geometries
- **Limitations:**
  - Processing takes a few minutes
  - Cannot update individual features
  - Requires re-upload for changes
- **Use cases:**
  - Administrative boundaries
  - Large geographic datasets
  - Base map layers

## Setup Instructions

### 1. Mapbox Account Requirements

1. **Create a Mapbox account** at https://account.mapbox.com/
2. **Generate an access token** with the required scopes:
   - For Dataset API: `datasets:read`, `datasets:write`, `datasets:list`
   - For Tileset API: `uploads:read`, `uploads:write`, `uploads:list`

To create a token:
1. Go to https://account.mapbox.com/access-tokens/
2. Click "Create a token"
3. Give it a name (e.g., "Ekistia Collect")
4. Check the required scopes
5. Click "Create token"
6. **Copy the token immediately** (you won't be able to see it again)

### 2. Get Your Mapbox Username

Your username is displayed in your Mapbox account. You can find it:
1. Go to https://account.mapbox.com/
2. Your username is shown in the top-left corner
3. It's also part of your profile URL: `account.mapbox.com/u/{username}/`

## Using the Collect Feature

### Step 1: Open the Collect Panel

1. Launch the application: `npm run dev`
2. Navigate to the Ekistia map view
3. Click the **"Collect"** button in the left sidebar (below the header)

### Step 2: Enter Mapbox Credentials

1. **Mapbox Username:** Enter your Mapbox username
2. **Access Token:** Enter your access token with the required scopes

**Note:** If you've set `VITE_MAPBOX_TOKEN` in your `.env` file, the token will be auto-populated.

### Step 3: Choose Upload Method

Select one of the two upload methods using the tabs:

#### Dataset API
- Select the "Dataset API" tab
- Best for data you'll update frequently
- Features are available immediately after upload

#### Tileset API
- Select the "Tileset API" tab
- Best for static data and large datasets
- Processing takes a few minutes but provides better performance

### Step 4: Provide Data Information

1. **Name:** Enter a name for your dataset/tileset
   - For datasets: Any descriptive name (e.g., "Agricultural Zones")
   - For tilesets: Use lowercase with hyphens (e.g., "agricultural-zones")
2. **Description:** (Optional) Add a description of your data

### Step 5: Upload GeoJSON File

1. Click "Choose File" and select your GeoJSON file
2. Supported formats: `.geojson` or `.json`
3. The file must be valid GeoJSON:
   - Feature: Single geographic feature
   - FeatureCollection: Multiple features

**GeoJSON Structure Example:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[124.2452, 8.228], [124.246, 8.229], ...]]
      },
      "properties": {
        "name": "Sample Barangay",
        "crop": "cacao",
        "suitability": "highly-suitable"
      }
    }
  ]
}
```

### Step 6: Upload

1. Click the **"Upload"** button
2. For Dataset API:
   - Progress will show as each feature is uploaded
   - Rate limit: 40 writes/minute (1.5 second delay between features)
3. For Tileset API:
   - GeoJSON is uploaded to S3
   - Tileset processing begins
   - Progress updates every 5 seconds
   - Complete processing may take several minutes

### Step 7: Success

Once upload is complete, you'll see:
- **Dataset ID** or **Tileset ID**
- **Feature count**
- Instructions for using the data

## Using Uploaded Data in Your Map

### Using a Dataset

Datasets are not directly renderable on maps. You need to either:

1. **Convert to Tileset:** Use Mapbox Studio to publish the dataset as a tileset
2. **Use in GeoJSON Source:** Fetch dataset features via API and render as GeoJSON

**Example - Fetch and Render:**
```typescript
import { listFeatures } from '@/services/mapboxApi';

// Fetch features from dataset
const features = await listFeatures(credentials, datasetId);

// Add to map as GeoJSON source
map.addSource('my-dataset', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: features
  }
});

map.addLayer({
  id: 'my-dataset-layer',
  type: 'fill',
  source: 'my-dataset',
  paint: {
    'fill-color': '#088',
    'fill-opacity': 0.8
  }
});
```

### Using a Tileset

Tilesets can be added directly to your map style:

**Example - Add Tileset to Map:**
```typescript
import { addSourceToStyle, addLayerToStyle } from '@/services/mapboxApi';

// Add source to style
await addSourceToStyle(credentials, styleId, 'my-tileset-source', {
  type: 'vector',
  url: `mapbox://${username}.${tilesetName}`
});

// Add layer to style
await addLayerToStyle(credentials, styleId, {
  id: 'my-tileset-layer',
  type: 'fill',
  source: 'my-tileset-source',
  'source-layer': 'default', // or your source layer name
  paint: {
    'fill-color': '#088',
    'fill-opacity': 0.8
  }
});
```

**Or in your React component:**
```tsx
<Source
  id="my-tileset"
  type="vector"
  url={`mapbox://${username}.${tilesetName}`}
>
  <Layer
    id="my-tileset-layer"
    type="fill"
    source-layer="default"
    paint={{
      'fill-color': '#088',
      'fill-opacity': 0.8
    }}
  />
</Source>
```

## API Reference

See `src/services/mapboxApi.ts` for complete API documentation.

### Key Functions

#### Dataset Operations
```typescript
// Create a dataset
createDataset(credentials, name, description?)

// Upload a feature
uploadFeature(credentials, datasetId, feature)

// Upload multiple features
uploadFeatures(credentials, datasetId, features)

// Complete workflow
createDatasetWithFeatures(credentials, name, features, description?)
```

#### Tileset Operations
```typescript
// Get S3 credentials
getS3Credentials(credentials)

// Upload to S3
uploadToS3(s3Credentials, geojsonData)

// Create upload/tileset
createUpload(credentials, tilesetName, s3Url)

// Check upload status
checkUploadStatus(credentials, uploadId)

// Complete workflow
uploadGeoJSONAndCreateTileset(credentials, tilesetName, geojsonData)
```

#### Style Operations
```typescript
// Add source to style
addSourceToStyle(credentials, styleId, sourceId, source)

// Add layer to style
addLayerToStyle(credentials, styleId, layer, beforeLayerId?)
```

## Troubleshooting

### "Failed to create dataset: Unauthorized"
- Check that your access token has the required scopes
- Verify your username is correct
- Make sure the token hasn't expired

### "Failed to upload feature: Rate limit exceeded"
- The Dataset API has a 40 writes/minute limit
- The upload function automatically adds 1.5s delays between features
- For large datasets, consider using the Tileset API instead

### "Invalid GeoJSON"
- Ensure your file is valid GeoJSON format
- Check that coordinates use the correct format: [longitude, latitude]
- Validate your GeoJSON at https://geojson.io/

### "Tileset processing timed out"
- Large datasets may take longer than the 5-minute polling window
- Check Mapbox Studio for processing status
- The tileset will still complete processing in the background

### "Features not rendering on map"
- For datasets: Make sure you've converted to tileset or are fetching via API
- For tilesets: Verify the tileset processing is complete
- Check that the source layer name matches your data
- Ensure your map style has the correct source and layer configuration

## Best Practices

### Data Preparation
1. **Validate GeoJSON** before uploading (use geojson.io)
2. **Optimize coordinates** - remove unnecessary precision
3. **Add meaningful properties** - include metadata for filtering and styling
4. **Use consistent naming** - lowercase with hyphens for tileset names

### Performance
1. **Choose the right method:**
   - Datasets: < 1000 features, frequently updated
   - Tilesets: > 1000 features, static data
2. **Batch operations:** Upload multiple features in one dataset operation
3. **Monitor rate limits:** Respect API rate limits to avoid throttling

### Security
1. **Never commit tokens** to version control
2. **Use environment variables** for tokens in production
3. **Limit token scopes** to only what's needed
4. **Rotate tokens regularly**

## Example Workflows

### Workflow 1: Upload Agricultural Zone Data

```typescript
import { createDatasetWithFeatures } from '@/services/mapboxApi';

const credentials = {
  accessToken: process.env.VITE_MAPBOX_TOKEN,
  username: 'your-username'
};

// Prepare features
const features = barangays.map(barangay => ({
  type: 'Feature',
  properties: {
    name: barangay.name,
    suitability: barangay.suitabilityData[0].suitabilityLevel,
    crop: barangay.suitabilityData[0].crop
  },
  geometry: barangay.geojsonFeature.geometry
}));

// Upload
const result = await createDatasetWithFeatures(
  credentials,
  'agricultural-zones',
  features,
  'Barangay agricultural suitability zones'
);

console.log(`Uploaded ${result.uploadedCount} features to dataset ${result.datasetId}`);
```

### Workflow 2: Create Tileset from Boundary Data

```typescript
import { uploadGeoJSONAndCreateTileset, checkUploadStatus } from '@/services/mapboxApi';

const credentials = {
  accessToken: process.env.VITE_MAPBOX_TOKEN,
  username: 'your-username'
};

// Prepare GeoJSON
const geojson = {
  type: 'FeatureCollection',
  features: barangays.map(b => b.geojsonFeature)
};

// Upload and create tileset
const result = await uploadGeoJSONAndCreateTileset(
  credentials,
  'iligan-barangays',
  geojson
);

// Poll for completion
const checkStatus = async () => {
  const status = await checkUploadStatus(credentials, result.uploadId);
  if (status.complete && !status.error) {
    console.log(`Tileset ready: ${result.tilesetId}`);
  } else if (status.error) {
    console.error(`Error: ${status.error}`);
  } else {
    console.log(`Progress: ${status.progress}%`);
    setTimeout(checkStatus, 5000);
  }
};

checkStatus();
```

## Resources

- [Mapbox Datasets API Documentation](https://docs.mapbox.com/api/maps/datasets/)
- [Mapbox Uploads API Documentation](https://docs.mapbox.com/api/maps/uploads/)
- [Mapbox Styles API Documentation](https://docs.mapbox.com/api/maps/styles/)
- [Mapbox Studio](https://studio.mapbox.com/)
- [GeoJSON Specification](https://geojson.org/)
- [GeoJSON Validator](https://geojson.io/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Mapbox API documentation
3. Consult the service module code at `src/services/mapboxApi.ts`
4. Check Mapbox Studio for dataset/tileset status
