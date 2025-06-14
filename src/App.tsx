
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Benefits from "./pages/Benefits";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import JobRequests from "./pages/JobRequests";
import PostJob from "./pages/PostJob";
import Messages from "./pages/Messages";
import Reviews from "./pages/Reviews";
import Notifications from "./pages/Notifications";
import ApprovedBookings from "./pages/ApprovedBookings";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

// Profile subpages
import ProfilePortfolio from "./pages/ProfilePages/ProfilePortfolio";
import ProfileReviews from "./pages/ProfilePages/ProfileReviews";
import ProfileCalendar from "./pages/ProfilePages/ProfileCalendar";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import AdminJobRequests from "./pages/admin/JobRequests";
import AdminReviews from "./pages/admin/Reviews";
import BlogManagement from "./pages/admin/BlogManagement";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";

import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Blog routes */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* Protected routes */}
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/profile/:id/portfolio" element={<ProfilePortfolio />} />
              <Route path="/profile/:id/reviews" element={<ProfileReviews />} />
              <Route path="/profile/:id/calendar" element={<ProfileCalendar />} />
              
              <Route path="/job-requests" element={<PrivateRoute><JobRequests /></PrivateRoute>} />
              <Route path="/post-job" element={<PrivateRoute><PostJob /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
              <Route path="/reviews" element={<PrivateRoute><Reviews /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              <Route path="/approved-bookings" element={<PrivateRoute><ApprovedBookings /></PrivateRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="content" element={<ContentModeration />} />
                <Route path="jobs" element={<AdminJobRequests />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="blog" element={<BlogManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
