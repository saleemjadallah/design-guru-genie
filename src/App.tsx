
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Index } from "./pages/Index";
import ReviewDetail from "./pages/ReviewDetail";
import FollowUpResults from "./pages/FollowUpResults";
import SavedReviews from "./pages/SavedReviews";
import { AuthPage } from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { Navigation } from "./components/layout/navigation";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/analysis/:id" element={<ReviewDetail />} />
        <Route path="/follow-up-results" element={<FollowUpResults />} />
        <Route path="/saved-reviews" element={<SavedReviews />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
