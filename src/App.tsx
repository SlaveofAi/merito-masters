
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import HowItWorks from "./pages/HowItWorks";
import Benefits from "./pages/Benefits";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import PostJob from "./pages/PostJob";
import JobRequests from "./pages/JobRequests";
import ApprovedBookings from "./pages/ApprovedBookings";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import AdminJobRequests from "./pages/admin/JobRequests";
import AdminReviews from "./pages/admin/Reviews";
import BlogManagement from "./pages/admin/BlogManagement";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, []);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Add home route that redirects to main page */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      
      {/* Redirect authenticated users away from auth pages */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <Register />} 
      />
      
      <Route path="/categories" element={<Categories />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/benefits" element={<Benefits />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      
      {/* Password reset routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
      
      {/* Job requests can be viewed by anyone */}
      <Route path="/job-requests" element={<JobRequests />} />
      
      {/* Protected Routes */}
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/profile/requests" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/profile/reviews" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/profile/portfolio" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/profile/calendar" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/profile/:id/:tab" element={<Profile />} />
      <Route path="/craftsman/:id" element={<Profile />} />
      <Route path="/post-job" element={<PrivateRoute><PostJob /></PrivateRoute>} />
      <Route path="/approved-bookings" element={<PrivateRoute><ApprovedBookings /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/reviews" element={<PrivateRoute><Reviews /></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<ContentModeration />} />
        <Route path="jobs" element={<AdminJobRequests />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="blog" element={<BlogManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
