
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Pothole } from '@/types';
import { format } from 'date-fns';
import GaussianSplattingViewer from './GaussianSplattingViewer';

interface PotholeDetailsProps {
  pothole: Pothole | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: Pothole['status']) => void;
}

export const PotholeDetails = ({
  pothole,
  onClose,
  onUpdateStatus
}: PotholeDetailsProps) => {
  if (!pothole) return null;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  const getSeverityColor = (severity: Pothole['severity']) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusBadge = (status: Pothole['status']) => {
    switch (status) {
      case 'reported':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reported</Badge>;
      case 'inspected':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Inspected</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-pothole-50 text-pothole-700 border-pothole-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="border border-gray-200 shadow-md animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-gray-800">Pothole #{pothole.id}</CardTitle>
          {getStatusBadge(pothole.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
          {pothole.images && pothole.images.length > 0 ? (
            <img 
              src={pothole.images[0]} 
              alt={`Pothole ${pothole.id}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Detection Accuracy</h4>
          <div className="flex items-center space-x-2">
            <Progress value={pothole.detectionAccuracy * 100} className="h-2" />
            <span className="text-sm font-medium">
              {Math.round(pothole.detectionAccuracy * 100)}%
            </span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Severity</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getSeverityColor(pothole.severity)}`}></div>
            <span className="capitalize">{pothole.severity}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
          <p className="text-sm">{pothole.location.address}</p>
          <p className="text-xs text-gray-500 mt-1">
            {pothole.location.lat.toFixed(6)}, {pothole.location.lng.toFixed(6)}
          </p>
        </div>
        
        {/* Gaussian Splatting 3D Visualization */}
        {pothole.lidarData && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">3D Visualization</h4>
              <GaussianSplattingViewer data={pothole.lidarData} />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-3">
              {pothole.lidarData.pointCloud && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700">Point Cloud</h5>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-xs text-gray-500">Density</span>
                      <p className="text-sm font-medium">{pothole.lidarData.pointCloud.density} pts/m²</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Points</span>
                      <p className="text-sm font-medium">{pothole.lidarData.pointCloud.points.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Accuracy</span>
                      <p className="text-sm font-medium">{(pothole.lidarData.pointCloud.accuracy * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              {pothole.lidarData.surface && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700">Surface Analysis</h5>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-xs text-gray-500">Depth</span>
                      <p className="text-sm font-medium">{pothole.lidarData.surface.depth} cm</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Width</span>
                      <p className="text-sm font-medium">{pothole.lidarData.surface.width} cm</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Area</span>
                      <p className="text-sm font-medium">{pothole.lidarData.surface.area} m²</p>
                    </div>
                  </div>
                </div>
              )}
              
              {pothole.lidarData.classification && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700">Classification</h5>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-xs text-gray-500">Confidence</span>
                      <p className="text-sm font-medium">{pothole.lidarData.classification.confidence}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Model</span>
                      <p className="text-sm font-medium">{pothole.lidarData.classification.model}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500">Scan Date</span>
                      <p className="text-sm font-medium">
                        {formatDate(pothole.lidarData.classification.scan_date)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500">Reported</h4>
            <p className="text-sm">{formatDate(pothole.reportDate)}</p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-500">Scheduled Repair</h4>
            <p className="text-sm">{formatDate(pothole.scheduledRepairDate)}</p>
          </div>
        </div>
        
        {pothole.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
            <p className="text-sm">{pothole.description}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline"
          className="border-pothole-300 text-pothole-700 hover:bg-pothole-50"
          onClick={onClose}
        >
          Close
        </Button>
        {onUpdateStatus && pothole.status !== 'completed' && (
          <Button 
            className="bg-pothole-500 hover:bg-pothole-600 text-white"
            onClick={() => {
              const nextStatus = (): Pothole['status'] => {
                switch (pothole.status) {
                  case 'reported': return 'inspected';
                  case 'inspected': return 'scheduled';
                  case 'scheduled': return 'in-progress';
                  case 'in-progress': return 'completed';
                  default: return 'reported';
                }
              };
              
              onUpdateStatus(pothole.id, nextStatus());
            }}
          >
            {pothole.status === 'reported' && 'Mark as Inspected'}
            {pothole.status === 'inspected' && 'Schedule Repair'}
            {pothole.status === 'scheduled' && 'Start Repair'}
            {pothole.status === 'in-progress' && 'Mark as Completed'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PotholeDetails;
