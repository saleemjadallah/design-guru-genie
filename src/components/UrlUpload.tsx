
import { useState } from "react";
import { Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const UrlUpload = ({ onUrlAnalyze }: { onUrlAnalyze: (imageUrl: string, analysisData: any) => void }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "URL is required",
        description: "Please enter a valid website URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Add protocol if missing
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    setIsLoading(true);

    try {
      toast({
        title: "Processing URL",
        description: "Taking screenshot and analyzing design...",
      });

      const { data, error } = await supabase.functions.invoke("screenshot-url", {
        body: { url: normalizedUrl },
      });

      if (error) {
        console.error("URL processing error:", error);
        throw error;
      }

      if (data?.success && data?.imageUrl && data?.analysis) {
        toast({
          title: "URL processed",
          description: "Website screenshot captured and analyzed.",
        });

        // Pass the captured screenshot and analysis data to the parent component
        onUrlAnalyze(data.imageUrl, data.analysis);
      } else {
        throw new Error("Failed to process URL");
      }
    } catch (error) {
      console.error("URL processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to process the URL. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl border-neutral-200 hover:border-accent/50 hover:bg-neutral-50 transition-all">
      <Link2
        className="w-16 h-16 mb-6 text-neutral-400"
      />
      <h3 className="text-2xl font-semibold mb-3 text-neutral-800">
        Analyze website by URL
      </h3>
      <p className="mb-6 text-neutral-600">
        Enter the website URL below and we'll capture and analyze it
      </p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="www.example.com"
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Analyze"}
          </button>
        </div>
      </form>
    </div>
  );
};
