/**
 * Mapbox API Service
 *
 * This service provides functions to interact with:
 * - Mapbox Datasets API: Create and manage datasets
 * - Mapbox Uploads API: Upload data and create tilesets
 * - Mapbox Styles API: Programmatically edit map styles
 */

const MAPBOX_API_BASE = 'https://api.mapbox.com';

export interface MapboxCredentials {
  accessToken: string;
  username: string;
}

export interface DatasetCreateResponse {
  id: string;
  name: string;
  description?: string;
  created: string;
  modified: string;
}

export interface FeatureUploadResult {
  id: string;
  type: 'Feature';
  geometry: any;
  properties: any;
}

export interface S3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  bucket: string;
  key: string;
  url: string;
}

export interface UploadCreateResponse {
  id: string;
  name: string;
  complete: boolean;
  error?: string;
  created: string;
  modified: string;
  tileset: string;
  owner: string;
  progress: number;
}

export interface StyleSource {
  type: string;
  url?: string;
  tiles?: string[];
  data?: any;
}

export interface StyleLayer {
  id: string;
  type: string;
  source: string;
  'source-layer'?: string;
  paint?: any;
  layout?: any;
  filter?: any;
}

/**
 * Create a new dataset
 */
export async function createDataset(
  credentials: MapboxCredentials,
  name: string,
  description?: string
): Promise<DatasetCreateResponse> {
  const response = await fetch(
    `${MAPBOX_API_BASE}/datasets/v1/${credentials.username}?access_token=${credentials.accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create dataset: ${error}`);
  }

  return response.json();
}

/**
 * List all datasets
 */
export async function listDatasets(
  credentials: MapboxCredentials
): Promise<DatasetCreateResponse[]> {
  const response = await fetch(
    `${MAPBOX_API_BASE}/datasets/v1/${credentials.username}?access_token=${credentials.accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list datasets: ${error}`);
  }

  return response.json();
}

/**
 * Upload a feature to a dataset
 */
export async function uploadFeature(
  credentials: MapboxCredentials,
  datasetId: string,
  feature: GeoJSON.Feature
): Promise<FeatureUploadResult> {
  const featureId = feature.id || `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const response = await fetch(
    `${MAPBOX_API_BASE}/datasets/v1/${credentials.username}/${datasetId}/features/${featureId}?access_token=${credentials.accessToken}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feature),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload feature: ${error}`);
  }

  return response.json();
}

/**
 * Upload multiple features to a dataset (batch operation)
 */
export async function uploadFeatures(
  credentials: MapboxCredentials,
  datasetId: string,
  features: GeoJSON.Feature[]
): Promise<FeatureUploadResult[]> {
  const results: FeatureUploadResult[] = [];

  // Upload features one by one (API limitation)
  for (const feature of features) {
    try {
      const result = await uploadFeature(credentials, datasetId, feature);
      results.push(result);

      // Add a small delay to respect rate limits (40 writes/minute)
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Failed to upload feature:', error);
      // Continue with next feature
    }
  }

  return results;
}

/**
 * Get S3 credentials for uploading files
 */
export async function getS3Credentials(
  credentials: MapboxCredentials
): Promise<S3Credentials> {
  const response = await fetch(
    `${MAPBOX_API_BASE}/uploads/v1/${credentials.username}/credentials?access_token=${credentials.accessToken}`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get S3 credentials: ${error}`);
  }

  return response.json();
}

/**
 * Upload GeoJSON data to S3 using the provided credentials
 */
export async function uploadToS3(
  s3Credentials: S3Credentials,
  geojsonData: any
): Promise<void> {
  const response = await fetch(s3Credentials.url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(geojsonData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload to S3: ${error}`);
  }
}

/**
 * Create an upload to convert data to a tileset
 */
export async function createUpload(
  credentials: MapboxCredentials,
  tilesetName: string,
  s3Url: string
): Promise<UploadCreateResponse> {
  const response = await fetch(
    `${MAPBOX_API_BASE}/uploads/v1/${credentials.username}?access_token=${credentials.accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: s3Url,
        tileset: `${credentials.username}.${tilesetName}`,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create upload: ${error}`);
  }

  return response.json();
}

/**
 * Check the status of an upload
 */
export async function checkUploadStatus(
  credentials: MapboxCredentials,
  uploadId: string
): Promise<UploadCreateResponse> {
  const response = await fetch(
    `${MAPBOX_API_BASE}/uploads/v1/${credentials.username}/${uploadId}?access_token=${credentials.accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to check upload status: ${error}`);
  }

  return response.json();
}

/**
 * Get a style
 */
export async function getStyle(
  credentials: MapboxCredentials,
  styleId: string
): Promise<any> {
  const response = await fetch(
    `${MAPBOX_API_BASE}/styles/v1/${credentials.username}/${styleId}?access_token=${credentials.accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get style: ${error}`);
  }

  return response.json();
}

/**
 * Update a style
 */
export async function updateStyle(
  credentials: MapboxCredentials,
  styleId: string,
  style: any
): Promise<any> {
  const response = await fetch(
    `${MAPBOX_API_BASE}/styles/v1/${credentials.username}/${styleId}?access_token=${credentials.accessToken}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(style),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update style: ${error}`);
  }

  return response.json();
}

/**
 * Add a source to a style
 */
export async function addSourceToStyle(
  credentials: MapboxCredentials,
  styleId: string,
  sourceId: string,
  source: StyleSource
): Promise<any> {
  const style = await getStyle(credentials, styleId);

  // Add the new source
  style.sources[sourceId] = source;

  // Update the style
  return updateStyle(credentials, styleId, style);
}

/**
 * Add a layer to a style
 */
export async function addLayerToStyle(
  credentials: MapboxCredentials,
  styleId: string,
  layer: StyleLayer,
  beforeLayerId?: string
): Promise<any> {
  const style = await getStyle(credentials, styleId);

  // Add the new layer
  if (beforeLayerId) {
    const beforeIndex = style.layers.findIndex((l: any) => l.id === beforeLayerId);
    if (beforeIndex >= 0) {
      style.layers.splice(beforeIndex, 0, layer);
    } else {
      style.layers.push(layer);
    }
  } else {
    style.layers.push(layer);
  }

  // Update the style
  return updateStyle(credentials, styleId, style);
}

/**
 * Complete workflow: Upload GeoJSON data and create a tileset
 */
export async function uploadGeoJSONAndCreateTileset(
  credentials: MapboxCredentials,
  tilesetName: string,
  geojsonData: any
): Promise<{ uploadId: string; tilesetId: string }> {
  // Step 1: Get S3 credentials
  const s3Creds = await getS3Credentials(credentials);

  // Step 2: Upload GeoJSON to S3
  await uploadToS3(s3Creds, geojsonData);

  // Step 3: Create upload to convert to tileset
  const upload = await createUpload(credentials, tilesetName, s3Creds.url);

  return {
    uploadId: upload.id,
    tilesetId: upload.tileset,
  };
}

/**
 * Create a dataset and upload features
 */
export async function createDatasetWithFeatures(
  credentials: MapboxCredentials,
  name: string,
  features: GeoJSON.Feature[],
  description?: string
): Promise<{ datasetId: string; uploadedCount: number }> {
  // Step 1: Create dataset
  const dataset = await createDataset(credentials, name, description);

  // Step 2: Upload features
  const results = await uploadFeatures(credentials, dataset.id, features);

  return {
    datasetId: dataset.id,
    uploadedCount: results.length,
  };
}
