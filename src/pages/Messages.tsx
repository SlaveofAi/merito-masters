
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/chat/Chat";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        navigate("/login", { replace: true, state: { from: "messages" } });
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

  const handleRefresh = () => {
    window.location.reload();
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Správy</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Obnoviť správy
          </Button>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Správy sa neaktualizujú automaticky. Kliknite na tlačidlo "Obnoviť správy" pre zobrazenie nových správ.
              </p>
            </div>
          </div>
        </div>
        <Chat />
      </div>
    </Layout>
  );
};

export default Messages;
