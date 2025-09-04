
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckIcon, ClockIcon, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// Types for management documents
interface PotholeDocument {
  id: string;
  title: string;
  type: 'Inspection' | 'Repair Plan' | 'Budget Allocation' | 'Crew Assignment' | 'Material Requisition' | 'Completion Report';
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  due_date: string;
  assigned_to: string;
  pothole_id?: string;
  pothole_number?: number; // Added to link to potholes
}

interface DocumentManagementProps {
  className?: string;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({ className = "" }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<PotholeDocument[]>([]);
  const { toast } = useToast();

  // Fetch documents from Supabase
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('pothole_documents')
          .select(`
            *,
            potholes (pothole_number)
          `);

        if (error) throw error;

        if (data) {
          const transformedData: PotholeDocument[] = data.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type as PotholeDocument['type'],
            status: item.status as PotholeDocument['status'],
            priority: item.priority as PotholeDocument['priority'],
            due_date: item.due_date,
            assigned_to: item.assigned_to,
            pothole_id: item.pothole_id,
            pothole_number: item.potholes?.pothole_number
          }));
          
          setDocuments(transformedData);
          console.log("Fetched pothole documents:", transformedData);
        }
      } catch (error) {
        console.error('Error fetching pothole documents:', error);
        toast({
          variant: "destructive",
          title: "Error fetching documents",
          description: "Could not load pothole management documents. Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
      return matchesStatus && matchesType && matchesPriority;
    });
  }, [statusFilter, typeFilter, priorityFilter, documents]);

  const getPriorityBadge = (priority: PotholeDocument['priority']) => {
    switch (priority) {
      case 'Low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium</Badge>;
      case 'High':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
      case 'Critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: PotholeDocument['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
            <AlertTriangle className="h-3 w-3" />
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            <ClockIcon className="h-3 w-3" />
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            <CheckIcon className="h-3 w-3" />
            Completed
          </span>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className={`border border-gray-200 shadow-sm ${className}`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-lg font-bold">Pothole Management Documents</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <span className="hidden sm:inline text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-700">Status</label>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-700">Document Type</label>
              <Select 
                value={typeFilter} 
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Repair Plan">Repair Plan</SelectItem>
                  <SelectItem value="Crew Assignment">Crew Assignment</SelectItem>
                  <SelectItem value="Material Requisition">Material Requisition</SelectItem>
                  <SelectItem value="Completion Report">Completion Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block text-gray-700">Priority</label>
              <Select 
                value={priorityFilter} 
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 hidden sm:table-cell">
                    <span className="sr-only">Selection</span>
                  </TableHead>
                  <TableHead>Document Title</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                  <TableHead>Pothole ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/30">
                      <TableCell className="p-2 hidden sm:table-cell">
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 rounded border border-gray-300"></div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{doc.title}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{doc.type}</span>
                          {!doc.pothole_number && <span className="text-xs text-muted-foreground md:hidden">No Pothole</span>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                          {doc.type}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{getPriorityBadge(doc.priority)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{new Date(doc.due_date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden lg:table-cell">{doc.assigned_to}</TableCell>
                      <TableCell>
                        {doc.pothole_number ? (
                          <Badge variant="outline" className="bg-gray-50"># {doc.pothole_number}</Badge>
                        ) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No documents match your filters. Try adjusting your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentManagement;
