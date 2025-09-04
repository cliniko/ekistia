import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Barangay, CropType } from '@/types/agricultural';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Sprout } from "lucide-react";

interface AgriculturalDataVisualizationProps {
  barangays: Barangay[];
}

export const AgriculturalDataVisualization = ({ barangays }: AgriculturalDataVisualizationProps) => {
  // Prepare data for crop suitability distribution
  const cropSuitabilityData = () => {
    const crops: CropType[] = ['cacao', 'banana', 'mango', 'coconut', 'rice', 'corn'];
    return crops.map(crop => {
      const totalSuitable = barangays.reduce((sum, barangay) => {
        const suitability = barangay.suitabilityData.find(s => s.crop === crop);
        return sum + (suitability?.suitableArea || 0);
      }, 0);
      
      const barangaysWithCrop = barangays.filter(b => 
        b.suitabilityData.some(s => s.crop === crop)
      ).length;

      return {
        crop: crop.charAt(0).toUpperCase() + crop.slice(1),
        suitableArea: Math.round(totalSuitable),
        barangays: barangaysWithCrop,
        emoji: getCropEmoji(crop)
      };
    });
  };

  // Prepare data for suitability levels
  const suitabilityLevelData = () => {
    const levels = ['highly-suitable', 'moderately-suitable', 'low-suitable', 'not-suitable'];
    return levels.map(level => {
      const totalArea = barangays.reduce((sum, barangay) => {
        return sum + barangay.suitabilityData
          .filter(s => s.suitabilityLevel === level)
          .reduce((cropSum, s) => cropSum + s.suitableArea, 0);
      }, 0);

      return {
        level: level.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        area: Math.round(totalArea),
        color: getSuitabilityColor(level)
      };
    });
  };

  // Prepare data for top barangays by agricultural potential
  const topBarangaysData = () => {
    return barangays
      .map(barangay => ({
        name: barangay.name,
        agricultural: barangay.agriculturalArea,
        available: barangay.availableLand,
        matched: barangay.matchedArea || 0,
        demands: barangay.activeDemands
      }))
      .sort((a, b) => b.agricultural - a.agricultural)
      .slice(0, 10);
  };

  // Calculate summary statistics
  const totalAgricultural = barangays.reduce((sum, b) => sum + b.agriculturalArea, 0);
  const totalAvailable = barangays.reduce((sum, b) => sum + b.availableLand, 0);
  const totalMatched = barangays.reduce((sum, b) => sum + (b.matchedArea || 0), 0);
  const totalDemands = barangays.reduce((sum, b) => sum + b.activeDemands, 0);

  const getCropEmoji = (crop: CropType): string => {
    const emojiMap: Record<CropType, string> = {
      'cacao': '🍫',
      'banana': '🍌',
      'mango': '🥭',
      'coconut': '🥥',
      'rice': '🌾',
      'corn': '🌽'
    };
    return emojiMap[crop] || '🌱';
  };

  const getSuitabilityColor = (level: string): string => {
    switch (level) {
      case 'highly-suitable': return '#22c55e';
      case 'moderately-suitable': return '#eab308';
      case 'low-suitable': return '#f97316';
      case 'not-suitable': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Agricultural Data Analysis</h2>
        <p className="text-muted-foreground">
          Comprehensive insights into Iligan City's agricultural development potential
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalAgricultural.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Agricultural (ha)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalAvailable.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Available Land (ha)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalMatched.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Matched Zones (ha)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-accent" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalDemands}
                </div>
                <div className="text-xs text-muted-foreground">Active Demands</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Crop Suitability Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Crop Suitability by Area</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropSuitabilityData()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="crop" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value, index) => {
                    const item = cropSuitabilityData()[index];
                    return `${item?.emoji} ${value}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ha`, 'Suitable Area']}
                />
                <Bar dataKey="suitableArea" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suitability Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Suitability Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={suitabilityLevelData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="area"
                  label={({ level, area }) => `${level}: ${area.toLocaleString()} ha`}
                >
                  {suitabilityLevelData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ha`, 'Area']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Barangays by Agricultural Potential */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Top Barangays by Agricultural Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topBarangaysData()} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    'agricultural': 'Agricultural Area',
                    'available': 'Available Land',
                    'matched': 'Matched Zones'
                  };
                  return [`${value.toLocaleString()} ha`, labels[name] || name];
                }}
              />
              <Bar dataKey="agricultural" fill="hsl(var(--primary))" name="agricultural" />
              <Bar dataKey="available" fill="hsl(var(--secondary))" name="available" />
              <Bar dataKey="matched" fill="hsl(var(--accent))" name="matched" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Development Matching Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Development Activity by Barangay</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={topBarangaysData().slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="demands" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Active Demands"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgriculturalDataVisualization;