
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Pothole, Severity, Status } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";

interface DataVisualizationProps {
  potholes: Pothole[];
}

export const DataVisualization = ({ potholes }: DataVisualizationProps) => {
  const isMobile = useIsMobile();
  
  // Basic severity and status counts
  const severityCounts = {
    low: potholes.filter(p => p.severity === 'low').length,
    medium: potholes.filter(p => p.severity === 'medium').length,
    high: potholes.filter(p => p.severity === 'high').length,
    critical: potholes.filter(p => p.severity === 'critical').length,
  };
  
  const statusCounts = {
    reported: potholes.filter(p => p.status === 'reported').length,
    inspected: potholes.filter(p => p.status === 'inspected').length,
    scheduled: potholes.filter(p => p.status === 'scheduled').length,
    'in-progress': potholes.filter(p => p.status === 'in-progress').length,
    completed: potholes.filter(p => p.status === 'completed').length,
  };
  
  // Data for charts
  const severityData = [
    { name: 'Low', value: severityCounts.low, color: '#10b981' },
    { name: 'Medium', value: severityCounts.medium, color: '#f59e0b' },
    { name: 'High', value: severityCounts.high, color: '#f97316' },
    { name: 'Critical', value: severityCounts.critical, color: '#ef4444' },
  ];
  
  const statusData = [
    { name: 'Reported', value: statusCounts.reported, color: '#3b82f6' },
    { name: 'Inspected', value: statusCounts.inspected, color: '#8b5cf6' },
    { name: 'Scheduled', value: statusCounts.scheduled, color: '#f59e0b' },
    { name: 'In Progress', value: statusCounts['in-progress'], color: '#f97316' },
    { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
  ];

  // Advanced analytics: Detection accuracy by severity
  const accuracyBySeverity = [
    { 
      name: 'Low', 
      accuracy: potholes.filter(p => p.severity === 'low').reduce((acc, p) => acc + p.detectionAccuracy, 0) / 
                (potholes.filter(p => p.severity === 'low').length || 1) * 100
    },
    { 
      name: 'Medium', 
      accuracy: potholes.filter(p => p.severity === 'medium').reduce((acc, p) => acc + p.detectionAccuracy, 0) / 
                (potholes.filter(p => p.severity === 'medium').length || 1) * 100
    },
    { 
      name: 'High', 
      accuracy: potholes.filter(p => p.severity === 'high').reduce((acc, p) => acc + p.detectionAccuracy, 0) / 
                (potholes.filter(p => p.severity === 'high').length || 1) * 100
    },
    { 
      name: 'Critical', 
      accuracy: potholes.filter(p => p.severity === 'critical').reduce((acc, p) => acc + p.detectionAccuracy, 0) / 
                (potholes.filter(p => p.severity === 'critical').length || 1) * 100
    }
  ];

  // Time-based analytics: Reports by month
  const getMonthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        month: date.getMonth(),
        year: date.getFullYear(),
        count: 0
      };
    }).reverse();

    potholes.forEach(pothole => {
      const reportDate = new Date(pothole.reportDate);
      const monthIndex = months.findIndex(m => 
        m.month === reportDate.getMonth() && m.year === reportDate.getFullYear()
      );
      if (monthIndex >= 0) {
        months[monthIndex].count++;
      }
    });

    return months;
  };

  const monthlyReportData = getMonthlyData();

  // LiDAR data analytics
  const lidarDataAvailable = potholes.filter(p => p.lidarData).length;
  const averageDepth = potholes
    .filter(p => p.lidarData?.surface?.depth)
    .reduce((acc, p) => acc + (p.lidarData?.surface?.depth || 0), 0) / 
    (potholes.filter(p => p.lidarData?.surface?.depth).length || 1);

  const averageWidth = potholes
    .filter(p => p.lidarData?.surface?.width)
    .reduce((acc, p) => acc + (p.lidarData?.surface?.width || 0), 0) / 
    (potholes.filter(p => p.lidarData?.surface?.width).length || 1);

  // Scatter plot data: depth vs width
  const scatterData = potholes
    .filter(p => p.lidarData?.surface?.depth && p.lidarData?.surface?.width)
    .map(p => ({
      depth: p.lidarData?.surface?.depth || 0,
      width: p.lidarData?.surface?.width || 0,
      severity: p.severity,
      id: p.id
    }));
  
  // Calculate chart heights based on device
  const chartHeight = isMobile ? 220 : 240;
  
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Pothole Analytics</CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="rounded-full p-1 hover:bg-muted">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">About this data</h4>
                <p className="text-xs text-muted-foreground">
                  This analytics dashboard shows pothole data collected from LiDAR and computer vision 
                  systems deployed across the city. Data is updated every 24 hours.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} mb-4`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="severity">By Severity</TabsTrigger>
            {!isMobile && <TabsTrigger value="status">By Status</TabsTrigger>}
            {!isMobile && <TabsTrigger value="advanced">Advanced</TabsTrigger>}
            {isMobile && (
              <TabsTrigger value="more" className="col-span-2 mt-2">
                More Analytics
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Summary cards */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Potholes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{potholes.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {lidarDataAvailable} with LiDAR data ({((lidarDataAvailable / potholes.length) * 100).toFixed(1)}%)
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div>Depth: <span className="font-bold">{averageDepth.toFixed(1)}cm</span></div>
                    <div>Width: <span className="font-bold">{averageWidth.toFixed(1)}cm</span></div>
                    <div>Critical cases: <span className="font-bold text-red-500">{severityCounts.critical}</span></div>
                  </div>
                </CardContent>
              </Card>
            
              {/* Monthly trend chart */}
              <div className={`col-span-1 md:col-span-2 h-${isMobile ? '56' : '72'}`}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-44 md:h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={monthlyReportData}
                          margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 20 } : { top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={isMobile ? { fontSize: 10 } : {}} />
                          <YAxis tick={isMobile ? { fontSize: 10 } : {}} />
                          <Tooltip 
                            formatter={(value: any) => {
                              if (typeof value === 'number') {
                                return [`${value} potholes`, 'Count'];
                              }
                              return [`${value}`, 'Count'];
                            }}
                            contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#c4b5fd" name="Reported" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="severity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isMobile ? 70 : 80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend layout={isMobile ? "horizontal" : "vertical"} align={isMobile ? "center" : "right"} verticalAlign={isMobile ? "bottom" : "middle"} />
                        <Tooltip 
                          formatter={(value: any) => {
                            if (typeof value === 'number') {
                              return [`${value} potholes`, 'Count'];
                            }
                            return [`${value}`, 'Count'];
                          }}
                          contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Severity Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={severityData}
                        margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 20 } : { top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={isMobile ? { fontSize: 10 } : {}} />
                        <YAxis tick={isMobile ? { fontSize: 10 } : {}} />
                        <Tooltip 
                          formatter={(value: any) => {
                            if (typeof value === 'number') {
                              return [`${value} potholes`, 'Count'];
                            }
                            return [`${value}`, 'Count'];
                          }}
                          contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" name="Count">
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isMobile ? 70 : 80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend layout={isMobile ? "horizontal" : "vertical"} align={isMobile ? "center" : "right"} verticalAlign={isMobile ? "bottom" : "middle"} />
                        <Tooltip 
                          formatter={(value: any) => {
                            if (typeof value === 'number') {
                              return [`${value} potholes`, 'Count'];
                            }
                            return [`${value}`, 'Count'];
                          }}
                          contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusData}
                        margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 20 } : { top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={isMobile ? { fontSize: 10 } : {}} />
                        <YAxis tick={isMobile ? { fontSize: 10 } : {}} />
                        <Tooltip 
                          formatter={(value: any) => {
                            if (typeof value === 'number') {
                              return [`${value} potholes`, 'Count'];
                            }
                            return [`${value}`, 'Count'];
                          }}
                          contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                        />
                        <Bar dataKey="value" name="Count">
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detection accuracy chart */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Detection Accuracy by Severity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={accuracyBySeverity}
                        margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={isMobile ? { fontSize: 10 } : {}} />
                        <YAxis domain={[0, 100]} unit="%" tick={isMobile ? { fontSize: 10 } : {}} />
                        <Tooltip
                          formatter={(value: any) => {
                            if (typeof value === 'number') {
                              return [`${value.toFixed(1)}%`, 'Accuracy'];
                            }
                            return [`${value}%`, 'Accuracy'];
                          }}
                          contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                        />
                        <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" name="Accuracy" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Depth vs Width Scatter Plot */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pothole Depth vs Width</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="depth" 
                          name="Depth" 
                          unit="cm" 
                          tick={isMobile ? { fontSize: 10 } : {}}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="width" 
                          name="Width" 
                          unit="cm" 
                          tick={isMobile ? { fontSize: 10 } : {}}
                        />
                        <ZAxis 
                          type="category" 
                          dataKey="severity" 
                          name="Severity" 
                          range={[50, 200]} 
                        />
                        <Tooltip 
                          formatter={(value: any, name: any) => {
                            if (typeof value === 'number' && (name === 'Depth' || name === 'Width')) {
                              return [`${value}cm`, name];
                            }
                            return [value, name];
                          }}
                          contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                          cursor={{ strokeDasharray: '3 3' }}
                        />
                        <Scatter 
                          name="Potholes" 
                          data={scatterData} 
                          fill="#8b5cf6"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* New tab for mobile that combines Status and Advanced */}
          {isMobile && (
            <TabsContent value="more" className="space-y-6">
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                          <Tooltip 
                            formatter={(value: any) => {
                              if (typeof value === 'number') {
                                return [`${value} potholes`, 'Count'];
                              }
                              return [`${value}`, 'Count'];
                            }}
                            contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={accuracyBySeverity}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                          <Tooltip
                            formatter={(value: any) => {
                              if (typeof value === 'number') {
                                return [`${value.toFixed(1)}%`, 'Accuracy'];
                              }
                              return [`${value}%`, 'Accuracy'];
                            }}
                            contentStyle={{ background: 'white', border: '1px solid #ccc' }}
                          />
                          <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" name="Accuracy" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataVisualization;
