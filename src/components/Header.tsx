
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser } from '@/data/mockUsers';
import { AuthModal } from './AuthModal';
import logo from './logo.png';

export const Header = ({ 
  activePanel, 
  togglePanel 
}: { 
  activePanel: 'filters' | 'data' | 'documents' | null,
  togglePanel: (panel: 'filters' | 'data' | 'documents') => void
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl mx-auto rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-100">
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Eyeway Logo" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl md:text-2xl font-bold ml-2">Eyeway 2.0</h1>
          </div>
          
          {/* Embedded tabs */}
          <div className="hidden md:block">
            <Tabs value={activePanel || ""} className="w-fit">
              <TabsList>
                <TabsTrigger 
                  value="filters" 
                  onClick={() => togglePanel('filters')}
                  className={activePanel === 'filters' ? 'bg-pothole-500 text-white' : ''}
                >
                  Filters
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  onClick={() => togglePanel('data')}
                  className={activePanel === 'data' ? 'bg-pothole-500 text-white' : ''}
                >
                  Data Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  onClick={() => togglePanel('documents')}
                  className={activePanel === 'documents' ? 'bg-pothole-500 text-white' : ''}
                >
                  Documents
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            <span className="text-sm font-medium text-gray-600">Pothole Data: 1,750</span>
          </div>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-pothole-200 text-pothole-800">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">admin@eyeway.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" className="text-pothole-600 border-pothole-300 hover:text-pothole-700 hover:border-pothole-400" onClick={handleLogin}>Sign In</Button>
          )}
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthModal(false);
        }}
      />
    </header>
  );
};

export default Header;
