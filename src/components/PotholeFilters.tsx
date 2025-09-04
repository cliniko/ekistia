
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Status, Severity } from '@/types';

interface PotholeFiltersProps {
  severity: Severity | 'all';
  status: Status | 'all';
  onSeverityChange: (severity: Severity | 'all') => void;
  onStatusChange: (status: Status | 'all') => void;
  onClearFilters: () => void;
  totalPotholes: number;
  filteredCount: number;
}

export const PotholeFilters = ({
  severity,
  status,
  onSeverityChange,
  onStatusChange,
  onClearFilters,
  totalPotholes,
  filteredCount
}: PotholeFiltersProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Filter Potholes</h3>
          <Badge variant="outline" className="bg-pothole-50 text-pothole-700 border-pothole-200">
            Showing {filteredCount} of {totalPotholes}
          </Badge>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">Severity</label>
            <Select 
              value={severity} 
              onValueChange={(value) => onSeverityChange(value as Severity | 'all')}
            >
              <SelectTrigger className="w-full border-pothole-200 focus:ring-pothole-500">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">Status</label>
            <Select 
              value={status} 
              onValueChange={(value) => onStatusChange(value as Status | 'all')}
            >
              <SelectTrigger className="w-full border-pothole-200 focus:ring-pothole-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="inspected">Inspected</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full border-pothole-300 text-pothole-700 hover:bg-pothole-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotholeFilters;
