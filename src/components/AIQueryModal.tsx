import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AIQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultsGenerated?: (results: any) => void;
}

const examplePrompts = [
  "Find suitable areas for a cacao plantation, 1-2km from a road, near a waterway",
  "Identify areas for a cold storage facility within 5km of crop development zones",
  "Show areas with good soil quality and access to irrigation for rice farming"
];

export const AIQueryModal = ({ isOpen, onClose, onResultsGenerated }: AIQueryModalProps) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Empty query",
        description: "Please enter a query or select an example prompt.",
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    // Mock AI processing with delay
    setTimeout(() => {
      const mockResults = {
        query: query,
        foundAreas: Math.floor(Math.random() * 15) + 5,
        topLocations: [
          {
            name: "Barangay San Isidro",
            score: 94,
            distance: "1.2km from road",
            coordinates: [124.2456, 8.2280],
            area: "45.3 ha",
            soilQuality: "Prime (111)"
          },
          {
            name: "Barangay Poblacion East",
            score: 89,
            distance: "0.8km from road",
            coordinates: [124.2512, 8.2315],
            area: "32.7 ha",
            soilQuality: "Good (112)"
          },
          {
            name: "Barangay Magsaysay",
            score: 87,
            distance: "1.5km from road",
            coordinates: [124.2390, 8.2245],
            area: "28.9 ha",
            soilQuality: "Prime (111)"
          }
        ],
        criteria: extractCriteria(query)
      };

      setIsLoading(false);

      // Pass results to parent component for map visualization
      onResultsGenerated?.(mockResults);

      // Auto-close modal immediately
      handleClose();
    }, 2500);
  };

  const extractCriteria = (queryText: string) => {
    const criteria = [];
    if (queryText.toLowerCase().includes('road')) criteria.push('Proximity to roads');
    if (queryText.toLowerCase().includes('water')) criteria.push('Near water sources');
    if (queryText.toLowerCase().includes('soil')) criteria.push('Soil quality');
    if (queryText.toLowerCase().includes('cold storage')) criteria.push('Infrastructure access');
    if (queryText.toLowerCase().includes('cacao')) criteria.push('Suitable for cacao');
    if (queryText.toLowerCase().includes('rice')) criteria.push('Suitable for rice');
    return criteria.length > 0 ? criteria : ['Location suitability', 'Resource access'];
  };

  const useExamplePrompt = (promptText: string) => {
    setQuery(promptText);
    setResults(null);
  };

  const handleClose = () => {
    setQuery('');
    setResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[85vh] overflow-y-auto border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Sparkles className="w-5 h-5 text-gray-700" />
            Ekistia AI
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Describe the area you're looking for using natural language
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Query Input */}
          <div className="space-y-2">
            <Textarea
              id="ai-query"
              placeholder="Example: Find areas suitable for banana plantations with access to main roads and irrigation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px] border-gray-300 focus:border-gray-400 focus-visible:ring-gray-400 text-sm resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Example Prompts */}
          {!results && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Examples</label>
              <div className="flex flex-col gap-1.5">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => useExamplePrompt(prompt)}
                    className="text-xs text-left px-3 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Suitable Areas
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
