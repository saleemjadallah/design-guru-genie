
import React from "react";
import { Button } from "@/components/ui/button";

export type ImplementationTab = 'matrix' | 'checklist' | 'summary';

interface ImplementationTabsProps {
  activeTab: ImplementationTab;
  setActiveTab: (tab: ImplementationTab) => void;
}

export const ImplementationTabs: React.FC<ImplementationTabsProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
      <Button 
        variant="ghost" 
        className={`pb-2 rounded-none ${activeTab === 'matrix' ? 'border-b-2 border-primary' : ''}`}
        onClick={() => setActiveTab('matrix')}
      >
        Impact/Effort Matrix
      </Button>
      <Button 
        variant="ghost" 
        className={`pb-2 rounded-none ${activeTab === 'checklist' ? 'border-b-2 border-primary' : ''}`}
        onClick={() => setActiveTab('checklist')}
      >
        Implementation Checklist
      </Button>
      <Button 
        variant="ghost" 
        className={`pb-2 rounded-none ${activeTab === 'summary' ? 'border-b-2 border-primary' : ''}`}
        onClick={() => setActiveTab('summary')}
      >
        Time Investment
      </Button>
    </div>
  );
};
