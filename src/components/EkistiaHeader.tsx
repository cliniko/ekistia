import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, Filter, ShoppingCart, Sprout, Users, MapPin } from "lucide-react";

interface EkistiaHeaderProps {
  activePanel: 'filters' | 'data' | 'documents' | 'marketplace' | null;
  togglePanel: (panel: 'filters' | 'data' | 'documents' | 'marketplace') => void;
  totalAvailableLand: number;
  activeDemands: number;
}

export const EkistiaHeader = ({ 
  activePanel, 
  togglePanel, 
  totalAvailableLand, 
  activeDemands 
}: EkistiaHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Ekistia</h1>
              <p className="text-xs text-muted-foreground">Agricultural Development Mapping</p>
            </div>
          </div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant={activePanel === 'filters' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('filters')}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button
            variant={activePanel === 'data' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('data')}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Data Analysis
          </Button>
          <Button
            variant={activePanel === 'documents' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('documents')}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Documents
          </Button>
          <Button
            variant={activePanel === 'marketplace' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('marketplace')}
            className="gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Marketplace
          </Button>
        </nav>

        {/* Right: Stats */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-primary" />
              <div className="text-xs">
                <div className="font-medium text-foreground">{totalAvailableLand.toLocaleString()} ha</div>
                <div className="text-muted-foreground">Available Land</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-secondary" />
              <div className="text-xs">
                <div className="font-medium text-foreground">{activeDemands}</div>
                <div className="text-muted-foreground">Active Demands</div>
              </div>
            </div>
          </div>
          
          {/* Mobile Stats */}
          <div className="flex sm:hidden gap-2">
            <Badge variant="outline" className="text-xs">
              {totalAvailableLand.toLocaleString()} ha
            </Badge>
            <Badge variant="outline" className="text-xs">
              {activeDemands} demands
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border/50 px-4 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant={activePanel === 'filters' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('filters')}
            className="gap-1 text-xs whitespace-nowrap"
          >
            <Filter className="w-3 h-3" />
            Filters
          </Button>
          <Button
            variant={activePanel === 'data' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('data')}
            className="gap-1 text-xs whitespace-nowrap"
          >
            <BarChart3 className="w-3 h-3" />
            Data
          </Button>
          <Button
            variant={activePanel === 'documents' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('documents')}
            className="gap-1 text-xs whitespace-nowrap"
          >
            <FileText className="w-3 h-3" />
            Docs
          </Button>
          <Button
            variant={activePanel === 'marketplace' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('marketplace')}
            className="gap-1 text-xs whitespace-nowrap"
          >
            <ShoppingCart className="w-3 h-3" />
            Market
          </Button>
        </div>
      </div>
    </header>
  );
};

export default EkistiaHeader;