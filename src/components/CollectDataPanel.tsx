import React, { useState, useCallback } from 'react';
import { Upload, Database, Check, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  createDatasetWithFeatures,
  uploadGeoJSONAndCreateTileset,
  checkUploadStatus,
  addSourceToStyle,
  addLayerToStyle,
  MapboxCredentials
} from '@/services/mapboxApi';

interface CollectDataPanelProps {
  onClose: () => void;
}

type UploadMethod = 'dataset' | 'tileset';
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface UploadResult {
  method: UploadMethod;
  id: string;
  name: string;
  featureCount?: number;
  tilesetId?: string;
}

export const CollectDataPanel = ({ onClose }: CollectDataPanelProps) => {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('dataset');
  const [dataName, setDataName] = useState('');
  const [dataDescription, setDataDescription] = useState('');
  const [geojsonFile, setGeojsonFile] = useState<File | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [mapboxUsername, setMapboxUsername] = useState('');
  const [mapboxToken, setMapboxToken] = useState('');

  // Auto-populate Mapbox token from environment if available
  React.useEffect(() => {
    const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (envToken && envToken !== 'YOUR_MAPBOX_TOKEN_HERE') {
      setMapboxToken(envToken);
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json')) {
      setStatusMessage('Please select a GeoJSON file (.geojson or .json)');
      setStatus('error');
      return;
    }

    setGeojsonFile(file);
    setStatus('idle');
    setStatusMessage('');

    // Parse the GeoJSON file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        // Validate GeoJSON structure
        if (!json.type || (json.type !== 'FeatureCollection' && json.type !== 'Feature')) {
          throw new Error('Invalid GeoJSON: Must be a Feature or FeatureCollection');
        }

        setGeojsonData(json);

        // Auto-generate name from filename if not set
        if (!dataName) {
          const baseName = file.name.replace(/\.(geo)?json$/i, '');
          setDataName(baseName);
        }
      } catch (error) {
        console.error('Error parsing GeoJSON:', error);
        setStatusMessage('Invalid GeoJSON file: ' + (error as Error).message);
        setStatus('error');
        setGeojsonData(null);
      }
    };
    reader.readAsText(file);
  }, [dataName]);

  const getFeatureCount = useCallback(() => {
    if (!geojsonData) return 0;

    if (geojsonData.type === 'FeatureCollection') {
      return geojsonData.features?.length || 0;
    } else if (geojsonData.type === 'Feature') {
      return 1;
    }

    return 0;
  }, [geojsonData]);

  const handleUploadDataset = useCallback(async () => {
    if (!geojsonData || !dataName || !mapboxUsername || !mapboxToken) {
      setStatusMessage('Please fill in all required fields');
      setStatus('error');
      return;
    }

    const credentials: MapboxCredentials = {
      accessToken: mapboxToken,
      username: mapboxUsername
    };

    try {
      setStatus('uploading');
      setStatusMessage('Creating dataset...');

      // Extract features
      const features = geojsonData.type === 'FeatureCollection'
        ? geojsonData.features
        : [geojsonData];

      // Create dataset and upload features
      const result = await createDatasetWithFeatures(
        credentials,
        dataName,
        features,
        dataDescription || undefined
      );

      setStatus('success');
      setStatusMessage(`Successfully uploaded ${result.uploadedCount} features to dataset`);
      setUploadResult({
        method: 'dataset',
        id: result.datasetId,
        name: dataName,
        featureCount: result.uploadedCount
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
      setStatusMessage('Upload failed: ' + (error as Error).message);
    }
  }, [geojsonData, dataName, dataDescription, mapboxUsername, mapboxToken]);

  const handleUploadTileset = useCallback(async () => {
    if (!geojsonData || !dataName || !mapboxUsername || !mapboxToken) {
      setStatusMessage('Please fill in all required fields');
      setStatus('error');
      return;
    }

    const credentials: MapboxCredentials = {
      accessToken: mapboxToken,
      username: mapboxUsername
    };

    try {
      setStatus('uploading');
      setStatusMessage('Uploading GeoJSON data...');

      // Ensure GeoJSON is a FeatureCollection
      const featureCollection = geojsonData.type === 'FeatureCollection'
        ? geojsonData
        : {
            type: 'FeatureCollection',
            features: [geojsonData]
          };

      // Upload and create tileset
      const result = await uploadGeoJSONAndCreateTileset(
        credentials,
        dataName.replace(/\s+/g, '-').toLowerCase(),
        featureCollection
      );

      setStatus('processing');
      setStatusMessage('Processing tileset... This may take a few minutes.');

      // Poll for upload completion
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5 second intervals)

      const checkStatus = async () => {
        try {
          const uploadStatus = await checkUploadStatus(credentials, result.uploadId);

          if (uploadStatus.complete) {
            if (uploadStatus.error) {
              setStatus('error');
              setStatusMessage('Tileset processing failed: ' + uploadStatus.error);
            } else {
              setStatus('success');
              setStatusMessage('Tileset created successfully!');
              setUploadResult({
                method: 'tileset',
                id: result.uploadId,
                name: dataName,
                tilesetId: result.tilesetId,
                featureCount: getFeatureCount()
              });
            }
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              setStatus('error');
              setStatusMessage('Tileset processing timed out. Check Mapbox Studio for status.');
            } else {
              setStatusMessage(`Processing tileset... ${uploadStatus.progress}% complete`);
              setTimeout(checkStatus, 5000);
            }
          }
        } catch (error) {
          console.error('Status check failed:', error);
          setStatus('error');
          setStatusMessage('Failed to check upload status: ' + (error as Error).message);
        }
      };

      // Start checking status after 5 seconds
      setTimeout(checkStatus, 5000);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
      setStatusMessage('Upload failed: ' + (error as Error).message);
    }
  }, [geojsonData, dataName, mapboxUsername, mapboxToken, getFeatureCount]);

  const handleUpload = useCallback(() => {
    if (uploadMethod === 'dataset') {
      handleUploadDataset();
    } else {
      handleUploadTileset();
    }
  }, [uploadMethod, handleUploadDataset, handleUploadTileset]);

  const resetForm = useCallback(() => {
    setStatus('idle');
    setStatusMessage('');
    setUploadResult(null);
    setDataName('');
    setDataDescription('');
    setGeojsonFile(null);
    setGeojsonData(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Collect Data
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload GeoJSON data to Mapbox using Datasets or Tilesets API
          </p>
        </div>
      </div>

      {/* Mapbox Credentials */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <h3 className="font-semibold text-sm">Mapbox Credentials</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-username">Mapbox Username</Label>
            <Input
              id="mapbox-username"
              type="text"
              placeholder="your-username"
              value={mapboxUsername}
              onChange={(e) => setMapboxUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Access Token</Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="pk.xxx or sk.xxx"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Your token needs <code className="bg-muted px-1 py-0.5 rounded">datasets:write</code> or{' '}
          <code className="bg-muted px-1 py-0.5 rounded">uploads:write</code> scope
        </p>
      </div>

      {/* Upload Method Selection */}
      <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as UploadMethod)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dataset">Dataset API</TabsTrigger>
          <TabsTrigger value="tileset">Tileset API</TabsTrigger>
        </TabsList>

        <TabsContent value="dataset" className="space-y-4 mt-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Dataset API:</strong> Best for frequently updated data. Create a dataset and upload features individually.
              Supports up to 40 writes/minute. Features are immediately available.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="tileset" className="space-y-4 mt-4">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Tileset API:</strong> Best for static data and large datasets. Upload GeoJSON and create a tileset.
              Optimized for rendering. Processing takes a few minutes.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Data Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="data-name">
            {uploadMethod === 'dataset' ? 'Dataset' : 'Tileset'} Name *
          </Label>
          <Input
            id="data-name"
            type="text"
            placeholder={uploadMethod === 'dataset' ? 'my-dataset' : 'my-tileset'}
            value={dataName}
            onChange={(e) => setDataName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-description">Description</Label>
          <Textarea
            id="data-description"
            placeholder="Describe your data..."
            value={dataDescription}
            onChange={(e) => setDataDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="geojson-file">GeoJSON File *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="geojson-file"
              type="file"
              accept=".geojson,.json"
              onChange={handleFileChange}
              disabled={status === 'uploading' || status === 'processing'}
            />
            {geojsonFile && (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {geojsonData && (
          <div className="p-3 bg-muted/50 rounded-md text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Features:</span>
              <span className="font-semibold">{getFeatureCount()}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-semibold">{geojsonData.type}</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <Alert variant={status === 'error' ? 'destructive' : 'default'}>
          {status === 'uploading' || status === 'processing' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === 'success' ? (
            <Check className="h-4 w-4" />
          ) : status === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : null}
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      {/* Upload Result */}
      {uploadResult && status === 'success' && (
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 space-y-2">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
            <Check className="w-5 h-5" />
            Upload Successful!
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">ID:</span>{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">{uploadResult.id}</code>
            </div>
            {uploadResult.tilesetId && (
              <div>
                <span className="text-muted-foreground">Tileset:</span>{' '}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{uploadResult.tilesetId}</code>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Features:</span> {uploadResult.featureCount}
            </div>
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            You can now use this {uploadResult.method} in your map styles or access it via Mapbox Studio.
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {status === 'success' ? (
          <>
            <Button variant="outline" onClick={resetForm}>
              Upload Another
            </Button>
            <Button onClick={onClose}>Done</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                !geojsonData ||
                !dataName ||
                !mapboxUsername ||
                !mapboxToken ||
                status === 'uploading' ||
                status === 'processing'
              }
            >
              {status === 'uploading' || status === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {status === 'uploading' ? 'Uploading...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CollectDataPanel;
