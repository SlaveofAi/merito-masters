
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
import HowItWorks from "@/pages/HowItWorks";
import Benefits from "@/pages/Benefits";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import { supabase } from "@/integrations/supabase/client";
import AdminRoute from "@/components/admin/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import ContentModeration from "@/pages/admin/ContentModeration";
import AdminJobRequests from "@/pages/admin/JobRequests";
import Reviews from "@/pages/admin/Reviews";
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <Layout><Profile /></Layout>
                </PrivateRoute>
              } />
              <Route path="/profile/:tab" element={
                <PrivateRoute>
                  <Layout><Profile /></Layout>
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
                <Route path="reviews" element={<Reviews />} />
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
