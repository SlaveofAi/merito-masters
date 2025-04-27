
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfilePortfolio from "./pages/ProfilePages/ProfilePortfolio";
import ProfileReviews from "./pages/ProfilePages/ProfileReviews";
import ProfileCalendar from "./pages/ProfilePages/ProfileCalendar";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Profile routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            
            {/* New profile sub-pages */}
            <Route path="/profile/portfolio" element={<ProfilePortfolio />} />
            <Route path="/profile/reviews" element={<ProfileReviews />} />
            <Route path="/profile/calendar" element={<ProfileCalendar />} />
            <Route path="/profile/:id/portfolio" element={<ProfilePortfolio />} />
            <Route path="/profile/:id/reviews" element={<ProfileReviews />} />
            <Route path="/profile/:id/calendar" element={<ProfileCalendar />} />
            
            <Route path="/messages" element={<Messages />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
