
import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowUpRight, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FollowUpResults = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Simulated analysis results
  const [results, setResults] = useState({
    originalScore: 62,
    newScore: 89,
    improvement: 27,
    improvementAreas: [
      { category: "Accessibility", before: 58, after: 92, improvement: 34 },
      { category: "Visual Hierarchy", before: 65, after: 85, improvement: 20 },
      { category: "Consistency", before: 72, after: 94, improvement: 22 },
      { category: "Spacing", before: 55, after: 87, improvement: 32 },
    ],
    remainingIssues: [
      "Mobile menu could use more contrast for better visibility",
      "Consider adding alt text for all images to improve accessibility further",
      "Button hover states could be more distinct for better user feedback"
    ],
    overallFeedback: "Excellent improvement! Your design now follows most best practices and shows significant progress in all key areas. The visual hierarchy is much clearer, spacing is more consistent, and the accessibility has been greatly improved. Just a few minor issues remain that could be addressed in future iterations."
  });
  
  useEffect(() => {
    // Simulate loading time for analysis data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pt-16">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6 flex items-center gap-1 text-neutral-600 hover:text-neutral-900"
              onClick={() => navigate("/follow-up-analysis")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Follow-Up Analysis
            </Button>
            
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 mb-8 text-center">
                <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold text-gray-700">Loading your results...</h2>
                <p className="text-gray-500 mt-2">Preparing your detailed analysis report</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-8 mb-2">
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="text-2xl font-bold">Follow-Up Analysis Results</h1>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 rounded-lg p-5 text-center">
                      <div className="text-blue-800 text-sm mb-1">Original Score</div>
                      <div className="text-3xl font-bold text-blue-900">{results.originalScore}<span className="text-lg">/100</span></div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-5 text-center">
                      <div className="text-green-800 text-sm mb-1">New Score</div>
                      <div className="text-3xl font-bold text-green-900">{results.newScore}<span className="text-lg">/100</span></div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-5 text-center">
                      <div className="text-purple-800 text-sm mb-1">Improvement</div>
                      <div className="text-3xl font-bold text-purple-900">+{results.improvement}<span className="text-lg">%</span></div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Improvement By Category</h2>
                    <div className="space-y-4">
                      {results.improvementAreas.map((area, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{area.category}</span>
                            <span className="text-green-600 font-medium">+{area.improvement}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className="flex h-full rounded-full">
                              <div 
                                className="bg-blue-400 h-full" 
                                style={{ width: `${area.before}%` }}
                              ></div>
                              <div 
                                className="bg-green-500 h-full" 
                                style={{ width: `${area.improvement}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>Before: {area.before}/100</span>
                            <span>After: {area.after}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{results.overallFeedback}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Remaining Issues</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {results.remainingIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for the next step?</h3>
                  <p className="text-gray-700 mb-4">
                    You've made great progress! Consider subscribing to our premium plan for more advanced features 
                    and unlimited design analyses.
                  </p>
                  <Button className="bg-accent hover:bg-accent/90">
                    Explore Premium Features
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowUpResults;
