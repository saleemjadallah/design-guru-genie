
import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ScoreSection } from "@/components/follow-up/ScoreSection";
import { ImprovementSection } from "@/components/follow-up/ImprovementSection";
import { DesignStrengthsSection } from "@/components/follow-up/DesignStrengthsSection";
import { DesignIssuesSection } from "@/components/follow-up/DesignIssuesSection";
import { ScreenshotSection } from "@/components/follow-up/ScreenshotSection";
import { OverallFeedbackSection } from "@/components/follow-up/OverallFeedbackSection";
import { PremiumFeatureSection } from "@/components/follow-up/PremiumFeatureSection";
import { ResultsHeader } from "@/components/follow-up/ResultsHeader";
import { LoadingScreen } from "@/components/follow-up/LoadingScreen";
import { HistoricalImprovementSection } from "@/components/follow-up/HistoricalImprovementSection";
import { Overview } from "@/components/analysis/Overview";
import { FeedbackPanel } from "@/components/feedback/FeedbackPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

// Helper to type check Claude AI response structure
interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

const FollowUpResults = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { reviewId } = useParams();
  
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
      { title: "Improved Color Contrast", description: "Text elements now have sufficient contrast against backgrounds", id: 1, location: null },
      { title: "Consistent Typography", description: "Font sizes and styles are now more consistent throughout the interface", id: 2, location: null },
      { title: "Better Element Spacing", description: "Improved spacing between elements creates better visual flow", id: 3, location: null },
      { title: "Clear Visual Hierarchy", description: "Important elements stand out more clearly in the updated design", id: 4, location: null }
    ],
    issues: {
      high: [
        { title: "Navigation Contrast", description: "Mobile menu needs more contrast for better visibility", id: 1, location: null },
        { title: "Form Field Labels", description: "Some form field labels are still difficult to read on certain backgrounds", id: 2, location: null }
      ],
      medium: [
        { title: "Button Hover States", description: "Button hover states could be more distinct for better user feedback", id: 3, location: null },
        { title: "Loading Indicators", description: "Consider adding loading indicators for async operations", id: 4, location: null }
      ],
      low: [
        { title: "Minor Spacing Issues", description: "Some padding inconsistencies in card components", id: 5, location: null },
        { title: "Image Alt Text", description: "Add alt text for all remaining images to improve accessibility further", id: 6, location: null }
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
  
  const [historicalData, setHistoricalData] = useState({
    overallScoreHistory: [
      { date: "Jan 10", score: 45, label: "Initial Design" },
      { date: "Feb 5", score: 62, label: "First Iteration" },
      { date: "Mar 15", score: 89, label: "Current Design" }
    ],
    categoryComparisons: [
      { category: "Accessibility", previous: 58, current: 92 },
      { category: "Visual Hierarchy", previous: 65, current: 85 },
      { category: "Consistency", previous: 72, current: 94 },
      { category: "Spacing", previous: 55, current: 87 }
    ],
    analysisCount: 3
  });

  // Helper function to type-check if an object is a Claude response
  function isClaudeResponse(obj: any): obj is ClaudeResponse {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'content' in obj &&
      Array.isArray(obj.content) &&
      obj.content.length > 0 &&
      typeof obj.content[0] === 'object' &&
      'text' in obj.content[0] &&
      typeof obj.content[0].text === 'string'
    );
  }

  // Fetch review data if reviewId is provided
  useEffect(() => {
    const fetchReviewData = async () => {
      if (reviewId) {
        try {
          const { data, error } = await supabase
            .from('saved_reviews')
            .select('*')
            .eq('id', reviewId)
            .single();

          if (error) {
            console.error("Error fetching review:", error);
            toast({
              title: "Error",
              description: "Failed to load review data",
              variant: "destructive"
            });
            return;
          }

          if (data) {
            // Try to parse feedback if it's in Claude's format
            let parsedFeedback;
            if (data.feedback && typeof data.feedback === 'object') {
              if (isClaudeResponse(data.feedback)) {
                try {
                  const claudeResponse = data.feedback as ClaudeResponse;
                  const claudeContent = JSON.parse(claudeResponse.content[0].text);
                  
                  // Update issues with data from Claude
                  const highIssues = [];
                  const mediumIssues = [];
                  const lowIssues = [];
                  
                  if (claudeContent.issues) {
                    for (const issue of claudeContent.issues) {
                      const formattedIssue = {
                        title: issue.issue,
                        description: issue.recommendation,
                        id: issue.id || highIssues.length + mediumIssues.length + lowIssues.length + 1,
                        location: issue.location || null
                      };
                      
                      if (issue.priority === 'high') {
                        highIssues.push(formattedIssue);
                      } else if (issue.priority === 'medium') {
                        mediumIssues.push(formattedIssue);
                      } else {
                        lowIssues.push(formattedIssue);
                      }
                    }
                  }
                  
                  // Update positive aspects from Claude
                  const positiveAspects = claudeContent.strengths?.map((item: any, index: number) => ({
                    title: item.title,
                    description: item.description,
                    id: item.id || index + 1,
                    location: item.location || null
                  })) || results.positiveAspects;

                  setResults(prev => ({
                    ...prev,
                    positiveAspects,
                    issues: {
                      high: highIssues.length > 0 ? highIssues : prev.issues.high,
                      medium: mediumIssues.length > 0 ? mediumIssues : prev.issues.medium,
                      low: lowIssues.length > 0 ? lowIssues : prev.issues.low
                    },
                    screenshot: data.image_url || prev.screenshot,
                    isScreenshotAnalysis: data.image_url?.startsWith('data:image/svg+xml') || false,
                    overallFeedback: claudeContent.overview || prev.overallFeedback
                  }));
                } catch (e) {
                  console.error("Error parsing Claude response:", e);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error in fetchReviewData:", err);
        }
      }
      
      // Set loading to false regardless of whether we have a reviewId
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    fetchReviewData();
  }, [reviewId]);

  const positiveFeatures = results.positiveAspects.map((aspect, index) => ({
    type: "positive" as const,
    title: aspect.title,
    description: aspect.description,
    id: aspect.id || index,
    location: aspect.location
  }));

  const issuesList = [
    ...results.issues.high.map((issue, index) => ({
      type: "improvement" as const,
      title: issue.title,
      description: issue.description,
      priority: "high" as const,
      id: issue.id || index,
      location: issue.location
    })),
    ...results.issues.medium.map((issue, index) => ({
      type: "improvement" as const,
      title: issue.title,
      description: issue.description,
      priority: "medium" as const,
      id: issue.id || index + results.issues.high.length,
      location: issue.location
    })),
    ...results.issues.low.map((issue, index) => ({
      type: "improvement" as const,
      title: issue.title,
      description: issue.description,
      priority: "low" as const,
      id: issue.id || index + results.issues.high.length + results.issues.medium.length,
      location: issue.location
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
                <div id="results-content" className="bg-white rounded-xl shadow-sm p-8 mb-2">
                  <ResultsHeader />
                  
                  <ScoreSection 
                    originalScore={results.originalScore}
                    newScore={results.newScore}
                    improvement={results.improvement}
                  />
                  
                  <ImprovementSection improvementAreas={results.improvementAreas} />
                  
                  <HistoricalImprovementSection 
                    overallScoreHistory={historicalData.overallScoreHistory}
                    categoryComparisons={historicalData.categoryComparisons}
                    analysisCount={historicalData.analysisCount}
                  />
                  
                  <DesignStrengthsSection positiveAspects={results.positiveAspects} />
                  
                  <DesignIssuesSection issues={results.issues} />
                  
                  <ScreenshotSection 
                    screenshot={results.screenshot}
                    isScreenshotAnalysis={results.isScreenshotAnalysis}
                  />
                  
                  <OverallFeedbackSection feedback={results.overallFeedback} />
                  
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
