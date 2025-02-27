
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import SavedReviews from "./pages/SavedReviews";
import ReviewDetail from "./pages/ReviewDetail";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/saved-reviews" element={<SavedReviews />} />
        <Route path="/review/:id" element={<ReviewDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
