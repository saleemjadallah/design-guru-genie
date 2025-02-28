import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import Index from "@/pages/Index";
import SavedReviews from "@/pages/SavedReviews";
import ReviewDetail from "@/pages/ReviewDetail";
import NotFound from "@/pages/NotFound";
import FollowUpAnalysis from "@/pages/FollowUpAnalysis"; // Import the new page

function App() {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/saved-reviews" element={<SavedReviews />} />
        <Route path="/review/:id" element={<ReviewDetail />} />
        <Route path="/follow-up-analysis" element={<FollowUpAnalysis />} /> {/* Add the new route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
