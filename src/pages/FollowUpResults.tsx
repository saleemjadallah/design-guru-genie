
import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowUpRight, Download, Share2, Star, AlertCircle, AlertTriangle, Check, ThumbsUp } from "lucide-react";
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
    positiveAspects: [
      { title: "Improved Color Contrast", description: "Text elements now have sufficient contrast against backgrounds" },
      { title: "Consistent Typography", description: "Font sizes and styles are now more consistent throughout the interface" },
      { title: "Better Element Spacing", description: "Improved spacing between elements creates better visual flow" },
      { title: "Clear Visual Hierarchy", description: "Important elements stand out more clearly in the updated design" }
    ],
    issues: {
      high: [
        { title: "Navigation Contrast", description: "Mobile menu needs more contrast for better visibility" },
        { title: "Form Field Labels", description: "Some form field labels are still difficult to read on certain backgrounds" }
      ],
      medium: [
        { title: "Button Hover States", description: "Button hover states could be more distinct for better user feedback" },
        { title: "Loading Indicators", description: "Consider adding loading indicators for async operations" }
      ],
      low: [
        { title: "Minor Spacing Issues", description: "Some padding inconsistencies in card components" },
        { title: "Image Alt Text", description: "Add alt text for all remaining images to improve accessibility further" }
      ]
    },
    screenshot: "/lovable-uploads/7a4a7d46-2665-4c5b-9666-801339014a81.png",
    isScreenshotAnalysis: true,
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
              Back to Analysis Results
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
                    <h1 className="text-2xl font-bold">Design Analysis Results</h1>
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
                  
                  {/* Design Scores Section */}
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
                  
                  {/* Improvement Categories */}
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
                  
                  {/* Positive Aspects */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Design Strengths</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.positiveAspects.map((aspect, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex items-start">
                            <ThumbsUp className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-blue-800">{aspect.title}</h4>
                              <p className="text-sm text-blue-700 mt-1">{aspect.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Design Issues Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Design Issues</h2>
                    
                    {/* High Priority Issues */}
                    <div className="mb-6">
                      <h3 className="font-medium text-red-800 flex items-center mb-3">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        High Priority Issues
                      </h3>
                      <div className="space-y-3">
                        {results.issues.high.map((issue, index) => (
                          <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <h4 className="font-medium text-red-800">{issue.title}</h4>
                            <p className="text-sm text-red-700 mt-1">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Medium Priority Issues */}
                    <div className="mb-6">
                      <h3 className="font-medium text-orange-800 flex items-center mb-3">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Medium Priority Issues
                      </h3>
                      <div className="space-y-3">
                        {results.issues.medium.map((issue, index) => (
                          <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <h4 className="font-medium text-orange-800">{issue.title}</h4>
                            <p className="text-sm text-orange-700 mt-1">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Low Priority Issues */}
                    <div>
                      <h3 className="font-medium text-green-800 flex items-center mb-3">
                        <Check className="w-4 h-4 mr-2" />
                        Low Priority Issues
                      </h3>
                      <div className="space-y-3">
                        {results.issues.low.map((issue, index) => (
                          <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <h4 className="font-medium text-green-800">{issue.title}</h4>
                            <p className="text-sm text-green-700 mt-1">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Annotated Screenshot Section - Only show if it's a screenshot analysis */}
                  {results.isScreenshotAnalysis && results.screenshot && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Annotated Design</h2>
                      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <img 
                          src={results.screenshot} 
                          alt="Annotated design screenshot" 
                          className="w-full h-auto rounded-lg shadow-sm"
                        />
                        <p className="text-sm text-neutral-600 mt-3">
                          The annotated design highlights key areas that have been improved and issues that still need attention.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overall Feedback */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{results.overallFeedback}</p>
                  </div>
                  
                  {/* Premium Feature - Review Design Changes */}
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
