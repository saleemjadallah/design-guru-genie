
import React, { useState } from "react";
import { ArrowRight, CheckCircle, Download, BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScoreSection } from "@/components/follow-up/ScoreSection";
import { ImprovementSection } from "@/components/follow-up/ImprovementSection";
import { DesignStrengthsSection } from "@/components/follow-up/DesignStrengthsSection";
import { PremiumFeatureSection } from "@/components/follow-up/PremiumFeatureSection";
import { exportResultsAsPdf } from "@/utils/pdf-export";

const FollowUpAnalysisDemo = () => {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  const handleExportPdf = () => {
    exportResultsAsPdf("progress-dashboard", "design-progress-report.pdf");
  };
  
  // Sample data for the dashboard
  const improvementAreas = [
    { category: "Visual Hierarchy", before: 52, after: 76, improvement: 24 },
    { category: "Accessibility", before: 45, after: 77, improvement: 32 },
    { category: "User Experience", before: 60, after: 78, improvement: 18 },
  ];
  
  const positiveAspects = [
    { 
      title: "Improved Color Contrast", 
      description: "The updated design uses colors that meet WCAG 2.1 AA standards for text readability." 
    },
    { 
      title: "Better Visual Hierarchy", 
      description: "Elements are now arranged with clear importance, guiding users' attention effectively." 
    },
    { 
      title: "Simplified Navigation", 
      description: "Reduced navigation options create a more focused user journey." 
    },
    { 
      title: "Consistent Button Styles", 
      description: "All call-to-action buttons now follow the same design pattern." 
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Initial Results Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Design Critique Results</h2>
          
          <p className="text-gray-600 mb-6">
            We've analyzed your design and found 9 issues that could be improved. 
            Here are our detailed recommendations.
          </p>
          
          {/* Content would go here - truncated for example */}
          <div className="h-40 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center mb-6">
            <span className="text-gray-400">Design critique content would appear here</span>
          </div>
          
          {/* Follow Up Analysis Promo - First CTA */}
          <div className="border-t border-gray-200 mt-8 pt-6">
            <PremiumFeatureSection />
          </div>
        </div>
        
        {/* Sheet (Modal) for subscription */}
        <Sheet open={showSubscribeModal} onOpenChange={setShowSubscribeModal}>
          <SheetContent>
            <SheetHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 mx-auto">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <SheetTitle className="text-center">
                Upgrade to Track Your Progress
              </SheetTitle>
              <p className="text-gray-600">
                The follow-up analysis is a premium feature that helps you measure your design improvements over time.
              </p>
            </SheetHeader>
            
            <div className="py-6">
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <div className="flex items-center text-indigo-700 font-medium mb-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Your free initial analysis does not count
                </div>
                <p className="text-gray-700 text-sm">
                  Your first design critique is always free. The follow-up analysis is a separate premium feature available only to subscribers.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-700">Track progress with before/after metrics</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-700">Get professional verification of improvements</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                  <span className="text-gray-700">Share progress reports with your team</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Subscribe for $18/month
                </Button>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowSubscribeModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Progress Dashboard Preview */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preview: Follow-Up Analysis Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Here is what the progress tracking dashboard looks like after you implement recommendations and submit your improved design.
          </p>
          
          <div id="progress-dashboard" className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Your Design Progress</h2>
              <p className="text-indigo-100">Before and after implementing our recommendations</p>
            </div>
            
            <div className="p-6">
              {/* Main progress metrics */}
              <ScoreSection 
                originalScore={68}
                newScore={86}
                improvement={18}
              />
              
              {/* Progress bars for specific metrics */}
              <ImprovementSection improvementAreas={improvementAreas} />
              
              {/* Before/After visual comparison */}
              <h3 className="font-medium text-gray-900 mb-3">Visual Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Before</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 h-48 flex items-center justify-center">
                      <span className="text-gray-400">Before image</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">After</h4>
                  <div className="border border-indigo-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 h-48 flex items-center justify-center">
                      <span className="text-gray-400">After image</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Design Strengths Section */}
              <DesignStrengthsSection positiveAspects={positiveAspects} />
              
              {/* Remaining issues section */}
              <h3 className="font-medium text-gray-900 mb-3">Remaining Opportunities</h3>
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 mb-2">
                  Great progress! We have identified 2 additional improvements that could further enhance your design:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Improve mobile responsiveness for small screens</li>
                  <li>Enhance form validation feedback</li>
                </ul>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleExportPdf}
                  className="order-2 sm:order-1"
                >
                  <Download className="mr-2 h-4 w-4" /> Download PDF Report
                </Button>
                <Button 
                  className="order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  Schedule Next Review
                </Button>
              </div>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="text-center bg-indigo-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to track your design improvements?</h3>
            <p className="text-gray-600 mb-4">
              Subscribe today and get 30% off your first follow-up analysis.
            </p>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowSubscribeModal(true)}
            >
              Subscribe Now - $18/month
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpAnalysisDemo;
