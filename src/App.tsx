
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfilePortfolio from "./pages/ProfilePages/ProfilePortfolio";
import ProfileReviews from "./pages/ProfilePages/ProfileReviews";
import ProfileCalendar from "./pages/ProfilePages/ProfileCalendar";
import Messages from "./pages/Messages";
import ApprovedBookings from "./pages/ApprovedBookings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";

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
            <Route path="/categories" element={<Categories />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Search route - redirect to home page */}
            <Route path="/search" element={<Navigate to="/home" replace />} />
            
            {/* Profile routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            
            {/* Profile sub-pages - carefully ordered for proper routing */}
            <Route path="/profile/portfolio" element={<ProfilePortfolio />} />
            <Route path="/profile/reviews" element={<ProfileReviews />} />
            <Route path="/profile/calendar" element={<ProfileCalendar />} />
            <Route path="/profile/:id/portfolio" element={<ProfilePortfolio />} />
            <Route path="/profile/:id/reviews" element={<ProfileReviews />} />
            <Route path="/profile/:id/calendar" element={<ProfileCalendar />} />
            
            <Route path="/messages" element={<Messages />} />
            {/* Bookings route */}
            <Route path="/bookings" element={<ApprovedBookings />} />
            
            {/* Legacy route redirection */}
            <Route path="/jobs" element={<Navigate to="/bookings" replace />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
