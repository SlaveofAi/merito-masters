import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import JobRequests from "@/pages/JobRequests";
import JobRequestDetail from "@/pages/JobRequestDetail";
import CreateJobRequest from "@/pages/CreateJobRequest";
import CraftsmanProfile from "@/pages/CraftsmanProfile";
import CraftsmanSearch from "@/pages/CraftsmanSearch";
import PrivateRoute from "@/components/PrivateRoute";
import Chat from "@/pages/Chat";
import ChatConversation from "@/pages/ChatConversation";
import BookingRequests from "@/pages/BookingRequests";
import NotFound from "@/pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
import AdminRoute from "@/components/admin/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";

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
      <AuthProvider>
        <Router>
          <ThemeProvider defaultTheme="light" storageKey="lovable-theme">
            <Toaster position="top-center" richColors closeButton />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/craftsmen" element={<><Navbar /><CraftsmanSearch /><Footer /></>} />
              <Route path="/craftsmen/:id" element={<><Navbar /><CraftsmanProfile /><Footer /></>} />
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <Navbar />
                  <Profile />
                  <Footer />
                </PrivateRoute>
              } />
              <Route path="/profile/:tab" element={
                <PrivateRoute>
                  <Navbar />
                  <Profile />
                  <Footer />
                </PrivateRoute>
              } />
              <Route path="/job-requests" element={
                <PrivateRoute>
                  <Navbar />
                  <JobRequests />
                  <Footer />
                </PrivateRoute>
              } />
              <Route path="/job-requests/:id" element={
                <PrivateRoute>
                  <Navbar />
                  <JobRequestDetail />
                  <Footer />
                </PrivateRoute>
              } />
              <Route path="/create-job-request" element={
                <PrivateRoute>
                  <Navbar />
                  <CreateJobRequest />
                  <Footer />
                </PrivateRoute>
              } />
              <Route path="/chat" element={
                <PrivateRoute>
                  <Navbar />
                  <Chat />
                  <Footer />
                </PrivateRoute>
              } />
              <Route path="/chat/:id" element={
                <PrivateRoute>
                  <Navbar />
                  <ChatConversation />
                  <Footer />
                </PrivateRoute>
              } />
              <Route path="/booking-requests" element={
                <PrivateRoute>
                  <Navbar />
                  <BookingRequests />
                  <Footer />
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
                {/* More admin routes will be added */}
              </Route>
              
              {/* Fallback routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </ThemeProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
