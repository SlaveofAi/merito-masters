
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/chat/Chat";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // and we've finished loading auth state
    if (!loading) {
      setIsCheckingAuth(false);
      if (!user) {
        toast.error("Pre prístup k správam sa musíte prihlásiť");
        navigate("/login", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Check if we were redirected from another page with a conversation parameter
  useEffect(() => {
    if (user && location.state?.from === 'booking') {
      console.log("Redirected from booking page with conversation:", location.state);
      // This data will be handled in the Chat component
    }
  }, [location, user]);

  // Add debugging to help identify any issues
  useEffect(() => {
    if (user) {
      console.log("Authenticated user in Messages page:", user.id);
      console.log("Location state:", location.state);
    }
  }, [user, location]);

  if (loading || isCheckingAuth) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
          <h1 className="text-2xl font-bold mb-6">Správy</h1>
          <div className="bg-white rounded-lg shadow-sm h-[75vh]">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <h1 className="text-2xl font-bold mb-6">Správy</h1>
        <Chat />
      </div>
    </Layout>
  );
};

export default Messages;
