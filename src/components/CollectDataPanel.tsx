import React from 'react';
import { Database, X, Clock } from 'lucide-react';

interface CollectDataPanelProps {
  onClose: () => void;
}

export const CollectDataPanel = ({ onClose }: CollectDataPanelProps) => {
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
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Not Yet Available</h3>
              <p className="text-muted-foreground max-w-sm">
                The data collection feature is currently under development.
                Check back soon for updates on collecting and uploading geospatial data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectDataPanel;
