import React, { useState, useCallback } from 'react';
import { Database, X, Upload, FileText, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

interface CollectDataPanelProps {
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const CollectDataPanel = ({ onClose }: CollectDataPanelProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const allowedExtensions = ['.zip', '.csv', '.shp', '.dbf', '.shx', '.prj'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return {
        valid: false,
        error: 'Please upload shapefile (.zip) or CSV files only.'
      };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 50MB.'
      };
    }

    return { valid: true };
  };

  const processFile = useCallback(async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;

    // Create uploaded file entry
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      status: 'uploading'
    };

    setUploadedFiles(prev => [...prev, uploadedFile]);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status to processing
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'processing' as const } : f
      ));

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as completed
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'completed' as const } : f
      ));

    } catch (error) {
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? {
          ...f,
          status: 'error' as const,
          error: 'Upload failed. Please try again.'
        } : f
      ));
    }
  }, []);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        processFile(file);
      } else {
        // Add error file entry
        const errorFile: UploadedFile = {
          id: `${Date.now()}-${file.name}-error`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          status: 'error',
          error: validation.error
        };
        setUploadedFiles(prev => [...prev, errorFile]);
      }
    });
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return (
    <div className="fixed top-0 right-0 z-[500] w-96 h-screen bg-card/95 backdrop-blur-sm border-l border-border shadow-xl">
      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Collect Data</h3>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-muted rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Compact Upload Section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">Upload LGU Data</h4>
                <p className="text-sm text-muted-foreground">Shapefiles (.zip) or CSV files</p>
              </div>

              {/* Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/20 scale-105'
                    : 'border-border hover:border-blue-400 hover:bg-muted/30'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  multiple
                  accept=".zip,.csv,.shp,.dbf,.shx,.prj"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {isDragOver ? 'Drop files here' : 'Click to browse or drag & drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">Max 50MB per file</p>
                </div>
              </div>
            </div>

            {/* File Type Badges */}
            <div className="flex justify-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <MapPin className="w-3 h-3" />
                .zip
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <FileText className="w-3 h-3" />
                .csv
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground text-center">Files</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        {file.error && (
                          <p className="text-xs text-red-600">{file.error}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {file.status === 'uploading' && (
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {file.status === 'processing' && (
                          <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {file.status === 'completed' && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-3 h-3 text-red-600" />
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CPDO Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-green-900">City Planning & Development Office</h5>
                  <p className="text-xs text-green-700">Data Quality Authority</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-green-800 leading-relaxed">
                  CPDO serves as the primary authority for validating and certifying geospatial data accuracy,
                  ensuring compliance with municipal development standards and land use regulations.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-100/70 rounded p-2">
                    <p className="text-xs font-medium text-green-900 mb-1">Validation</p>
                    <p className="text-xs text-green-700">• Boundary accuracy<br/>• Zoning compliance<br/>• Coordinate systems</p>
                  </div>
                  <div className="bg-green-100/70 rounded p-2">
                    <p className="text-xs font-medium text-green-900 mb-1">Certification</p>
                    <p className="text-xs text-green-700">• Quality assurance<br/>• Standards compliance<br/>• Official approval</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Municipal Validation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Municipal Data Standards</p>
              </div>
              <p className="text-xs text-blue-700">
                All submissions undergo rigorous validation to ensure alignment with local development plans and regulatory requirements.
              </p>
            </div>

            {/* Compact Footer */}
            <div className="text-center pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Municipality ensures data quality & compliance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectDataPanel;
