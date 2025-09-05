import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, LabelList } from 'recharts';
import { Barangay, CropType, SuitabilityLevel } from '@/types/agricultural';
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
    const levels: SuitabilityLevel[] = ['highly-suitable', 'moderately-suitable', 'low-suitable', 'not-suitable'];
    return levels.map(level => {
      const totalArea = barangays.reduce((sum, barangay) => {
        return sum + barangay.suitabilityData
          .filter(s => s.suitabilityLevel === level)
          .reduce((cropSum, s) => cropSum + s.suitableArea, 0);
      }, 0);

      return {
        level: level.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        area: Math.round(totalArea),
        color: getSuitabilityHexColor(level)
      };
    });
  };

  // Prepare stacked composition data: suitability levels per crop
  const suitabilityCompositionByCropData = () => {
    const crops: CropType[] = ['cacao', 'banana', 'mango', 'coconut', 'rice', 'corn'];
    const levels: SuitabilityLevel[] = ['highly-suitable', 'moderately-suitable', 'low-suitable', 'not-suitable'];
    return crops.map((crop) => {
      const levelTotals: Record<SuitabilityLevel, number> = {
        'highly-suitable': 0,
        'moderately-suitable': 0,
        'low-suitable': 0,
        'not-suitable': 0
      };
      barangays.forEach((barangay) => {
        const s = barangay.suitabilityData.find((d) => d.crop === crop);
        if (s) {
          levelTotals[s.suitabilityLevel] += s.suitableArea;
        }
      });
      const label = `${getCropEmoji(crop)} ${crop.charAt(0).toUpperCase() + crop.slice(1)}`;
      return { crop: label, ...levelTotals };
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

  const getSuitabilityHexColor = (level: SuitabilityLevel): string => {
    switch (level) {
      case 'highly-suitable': return '#22c55e';
      case 'moderately-suitable': return '#eab308';
      case 'low-suitable': return '#f97316';
      case 'not-suitable': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const levelOrder: SuitabilityLevel[] = ['not-suitable', 'low-suitable', 'moderately-suitable', 'highly-suitable'];

  // Custom label renderer for donut to avoid overlaps: only show for sizeable slices
  const renderDonutLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, payload } = props;
    if (!percent || percent < 0.06) return null; // hide labels <6%
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 14;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: 12 }}>
        {payload.level}
      </text>
    );
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
        {/* Suitability Composition by Crop (Stacked) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Suitability Composition by Crop</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={suitabilityCompositionByCropData()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="crop" tick={{ fontSize: 12 }} interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number, name: string) => [`${(value as number).toLocaleString()} ha`, name.split('-').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ')]} />
                <Legend />
                {levelOrder.map((lvl) => (
                  <Bar key={lvl} dataKey={lvl} stackId="a" fill={getSuitabilityHexColor(lvl)} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suitability Level Distribution (Donut) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Suitability Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={suitabilityLevelData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  minAngle={8}
                  dataKey="area"
                  label={renderDonutLabel}
                  labelLine={false}
                >
                  {suitabilityLevelData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [`${(value as number).toLocaleString()} ha`, props?.payload?.level]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Barangays by Agricultural Potential (Stacked) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Top Barangays by Agricultural Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topBarangaysData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    'agricultural': 'Agricultural Area',
                    'available': 'Available Land',
                    'matched': 'Matched Zones'
                  };
                  return [`${(value as number).toLocaleString()} ha`, labels[name] || name];
                }}
              />
              <Legend />
              <Bar dataKey="agricultural" stackId="a" fill="hsl(var(--primary))" name="Agricultural" />
              <Bar dataKey="available" stackId="a" fill="hsl(var(--secondary))" name="Available" />
              <Bar dataKey="matched" stackId="a" fill="hsl(var(--accent))" name="Matched" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demand Intensity by Barangay (Area) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Demand Intensity by Barangay</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={topBarangaysData().slice(0, 8)}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${(value as number).toLocaleString()}`, 'Active Demands']} />
              <Area type="monotone" dataKey="demands" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorDemand)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgriculturalDataVisualization;