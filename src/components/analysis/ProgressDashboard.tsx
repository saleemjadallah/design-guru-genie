
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressDashboardProps {
  initialScore: number;
  followUpScore: number;
  issuesResolved: number;
  totalIssues: number;
  impactLevel: string;
  conversionEstimate: string;
  categoryImprovements: {
    name: string;
    beforeScore: number;
    afterScore: number;
  }[];
  beforeImageUrl: string;
  afterImageUrl: string;
  remainingIssues: string[];
}

export const ProgressDashboard = ({
  initialScore = 68,
  followUpScore = 86,
  issuesResolved = 7,
  totalIssues = 9,
  impactLevel = "High",
  conversionEstimate = "+15-20%",
  categoryImprovements = [
    { name: "Visual Hierarchy", beforeScore: 52, afterScore: 76 },
    { name: "Color Consistency", beforeScore: 45, afterScore: 85 },
    { name: "Accessibility", beforeScore: 60, afterScore: 78 },
    { name: "Information Architecture", beforeScore: 70, afterScore: 85 }
  ],
  beforeImageUrl = "https://via.placeholder.com/600x400",
  afterImageUrl = "https://via.placeholder.com/600x400",
  remainingIssues = [
    "Improve mobile responsiveness for small screens",
    "Enhance form validation feedback"
  ]
}: Partial<ProgressDashboardProps>) => {
  const scoreImprovement = followUpScore - initialScore;
  const completionRate = Math.round((issuesResolved / totalIssues) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Your Design Progress</h2>
        <p className="text-blue-100">Before and after implementing our recommendations</p>
      </div>
      
      <div className="p-6">
        {/* Main progress metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Score</h3>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl text-gray-400 line-through">{initialScore}/100</span>
              <ArrowUp className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{followUpScore}/100</span>
            </div>
            <p className="text-sm text-green-600 mt-1">+{scoreImprovement} points improvement</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Issues Resolved</h3>
            <div className="text-2xl font-bold text-gray-900">{issuesResolved}/{totalIssues}</div>
            <p className="text-sm text-green-600 mt-1">{completionRate}% completion rate</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Impact</h3>
            <div className="text-2xl font-bold text-gray-900">{impactLevel}</div>
            <p className="text-sm text-blue-600 mt-1">Conversion {conversionEstimate}</p>
          </div>
        </div>
        
        {/* Progress bars for specific metrics */}
        <h3 className="font-medium text-gray-900 mb-3">Improvement by Category</h3>
        <div className="space-y-4 mb-8">
          {categoryImprovements.map((category, index) => {
            const improvement = category.afterScore - category.beforeScore;
            return (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm font-medium text-gray-700">+{improvement}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="flex items-center h-2.5 rounded-full">
                    <div 
                      className="h-2.5 bg-gray-500 rounded-l-full" 
                      style={{ width: `${category.beforeScore}%` }}
                    ></div>
                    <div 
                      className="h-2.5 bg-blue-500 rounded-r-full" 
                      style={{ width: `${improvement}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Before: {category.beforeScore}%</span>
                  <span>After: {category.afterScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Before/After visual comparison */}
        <h3 className="font-medium text-gray-900 mb-3">Visual Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Before</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img src={beforeImageUrl} alt="Before changes" className="w-full" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">After</h4>
            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <img src={afterImageUrl} alt="After changes" className="w-full" />
            </div>
          </div>
        </div>
        
        {/* Remaining issues section */}
        <h3 className="font-medium text-gray-900 mb-3">Remaining Opportunities</h3>
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 mb-2">
            Great progress! We've identified {remainingIssues.length} additional improvements that could further enhance your design:
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {remainingIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <Button variant="outline">
            Download PDF Report
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            Schedule Next Review
          </Button>
        </div>
      </div>
    </div>
  );
};
