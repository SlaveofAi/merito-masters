
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import PrivateRoute from "@/components/PrivateRoute";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Messages from "@/pages/Messages";
import JobRequests from "@/pages/JobRequests";
import PostJob from "@/pages/PostJob";
import Notifications from "@/pages/Notifications";
import Categories from "@/pages/Categories";
import ApprovedBookings from "@/pages/ApprovedBookings";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Benefits from "@/pages/Benefits";
import HowItWorks from "@/pages/HowItWorks";
import Pricing from "@/pages/Pricing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Reviews from "@/pages/Reviews";
import { supabase } from "@/integrations/supabase/client";
import AdminRoute from "@/components/admin/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import ContentModeration from "@/pages/admin/ContentModeration";
import AdminJobRequests from "@/pages/admin/JobRequests";
import AdminReviews from "@/pages/admin/Reviews";
import Analytics from "@/pages/admin/Analytics";
import Settings from "@/pages/admin/Settings";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Check connection on app start
    const checkSupabaseConnection = async () => {
      try {
        const isConnected = await supabase.from('profiles').select('id').limit(1).single();
        console.log("Supabase connection check:", isConnected.error ? "Failed" : "Success");
      } catch (error) {
        console.error("Supabase connection error:", error);
      }
    };
    
    checkSupabaseConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="majstri-ui-theme">
        <AuthProvider>
          <Router>
            <Toaster position="top-center" richColors closeButton />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Craftsman profile route - public access for viewing */}
              <Route path="/craftsman/:id" element={<Profile />} />
              
              {/* Protected routes - Profile routes should NOT be wrapped in Layout since ProfilePage already includes it */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/profile/:tab" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/messages" element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              } />
              <Route path="/job-requests" element={
                <PrivateRoute>
                  <JobRequests />
                </PrivateRoute>
              } />
              <Route path="/post-job" element={
                <PrivateRoute>
                  <PostJob />
                </PrivateRoute>
              } />
              <Route path="/notifications" element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } />
              <Route path="/approved-bookings" element={
                <PrivateRoute>
                  <ApprovedBookings />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
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
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Fallback routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
