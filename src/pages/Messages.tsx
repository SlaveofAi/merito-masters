
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/chat/Chat";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // and we've finished loading auth state
    if (!loading) {
      setIsCheckingAuth(false);
      if (!user) {
        toast.error(t("login_required"));
        navigate("/login", { replace: true, state: { from: "messages" } });
      } else {
        // Store user in localStorage for components that need it
        localStorage.setItem('user', JSON.stringify(user));
        console.log("User stored in localStorage:", user.id, "type:", user.user_metadata?.user_type);
      }
    }
  }, [user, loading, navigate, t]);

  // Check if we were redirected from another page with a conversation parameter
  useEffect(() => {
    if (user && location.state?.from === 'booking') {
      console.log("Redirected from booking page with conversation:", location.state);
      // This data will be handled in the Chat component
    }
  }, [location, user]);

  if (loading || isCheckingAuth) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
          <h1 className="text-2xl font-bold mb-6">{t("messages_title")}</h1>
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
          <h1 className="text-2xl font-bold">{t("messages_title")}</h1>
        </div>
        <Chat />
      </div>
    </Layout>
  );
};

export default Messages;

