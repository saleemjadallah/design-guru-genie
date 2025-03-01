
import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScoreSection } from "@/components/follow-up/ScoreSection";
import { ImprovementSection } from "@/components/follow-up/ImprovementSection";
import { DesignStrengthsSection } from "@/components/follow-up/DesignStrengthsSection";
import { DesignIssuesSection } from "@/components/follow-up/DesignIssuesSection";
import { ScreenshotSection } from "@/components/follow-up/ScreenshotSection";
import { OverallFeedbackSection } from "@/components/follow-up/OverallFeedbackSection";
import { PremiumFeatureSection } from "@/components/follow-up/PremiumFeatureSection";
import { ResultsHeader } from "@/components/follow-up/ResultsHeader";
import { LoadingScreen } from "@/components/follow-up/LoadingScreen";
import { Overview } from "@/components/analysis/Overview";
import { FeedbackPanel } from "@/components/FeedbackPanel";

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

  // Transform positive aspects to the format expected by Overview component
  const positiveFeatures = results.positiveAspects.map((aspect, index) => ({
    type: "positive" as const,
    title: aspect.title,
    description: aspect.description,
    id: index
  }));

  // Transform issues to the format expected by FeedbackPanel
  const issuesList = [
    ...results.issues.high.map((issue, index) => ({
      type: "improvement" as const,
      title: issue.title,
      description: issue.description,
      priority: "high" as const,
      id: index
    })),
    ...results.issues.medium.map((issue, index) => ({
      type: "improvement" as const,
      title: issue.title,
      description: issue.description,
      priority: "medium" as const,
      id: index + results.issues.high.length
    })),
    ...results.issues.low.map((issue, index) => ({
      type: "improvement" as const,
      title: issue.title,
      description: issue.description,
      priority: "low" as const,
      id: index + results.issues.high.length + results.issues.medium.length
    }))
  ];

  const getIssueCountByPriority = (priority: string) => {
    switch (priority) {
      case "high":
        return results.issues.high.length;
      case "medium":
        return results.issues.medium.length;
      case "low":
        return results.issues.low.length;
      default:
        return 0;
    }
  };
  
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
          <div className="max-w-5xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6 flex items-center gap-1 text-neutral-600 hover:text-neutral-900"
              onClick={() => navigate("/follow-up-analysis")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Analysis Results
            </Button>
            
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-8 mb-2">
                  <ResultsHeader />
                  
                  {/* Design Scores Section */}
                  <ScoreSection 
                    originalScore={results.originalScore}
                    newScore={results.newScore}
                    improvement={results.improvement}
                  />
                  
                  {/* Improvement Categories */}
                  <ImprovementSection improvementAreas={results.improvementAreas} />
                  
                  {/* Positive Aspects */}
                  <DesignStrengthsSection positiveAspects={results.positiveAspects} />
                  
                  {/* Design Issues Section */}
                  <DesignIssuesSection issues={results.issues} />
                  
                  {/* Annotated Screenshot Section */}
                  <ScreenshotSection 
                    screenshot={results.screenshot}
                    isScreenshotAnalysis={results.isScreenshotAnalysis}
                  />
                  
                  {/* Overall Feedback */}
                  <OverallFeedbackSection feedback={results.overallFeedback} />
                  
                  {/* Premium Feature */}
                  <PremiumFeatureSection />
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
