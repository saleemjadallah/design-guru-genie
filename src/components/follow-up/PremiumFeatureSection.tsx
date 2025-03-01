
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight } from "lucide-react";

export const PremiumFeatureSection = () => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-100">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-purple-900">Review Design Changes</h2>
          <p className="text-purple-800 mt-2">
            Get a detailed review of specific design changes made and their impact on user experience.
          </p>
          <ul className="mt-3 space-y-1">
            <li className="flex items-center text-sm text-purple-700">
              <Check className="w-4 h-4 mr-2 text-purple-600" />
              Side-by-side comparison of old and new designs
            </li>
            <li className="flex items-center text-sm text-purple-700">
              <Check className="w-4 h-4 mr-2 text-purple-600" />
              Element-specific improvement analysis
            </li>
            <li className="flex items-center text-sm text-purple-700">
              <Check className="w-4 h-4 mr-2 text-purple-600" />
              Detailed implementation recommendations
            </li>
          </ul>
        </div>
        
        <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1">
          Upgrade to Premium
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
