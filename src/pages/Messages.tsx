
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/chat/Chat";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useContacts } from "@/hooks/useContacts";

const Messages = () => {
  const { user, loading, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { contacts, contactsLoading } = useContacts();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // and we've finished loading auth state
    if (!loading) {
      setIsCheckingAuth(false);
      if (!user) {
        toast.error("Pre prístup k správam sa musíte prihlásiť");
        navigate("/login", { replace: true, state: { from: "messages" } });
      } else {
        // Store user in localStorage for components that need it
        localStorage.setItem('user', JSON.stringify(user));
        console.log("User stored in localStorage:", user.id, "type:", user.user_metadata?.user_type);
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

  // Show empty state message in these cases:
  // 1. Craftsman with no contacts
  // 2. Customer with no contacts to message
  const showEmptyStateMessage = 
    (userType === 'craftsman' && (!contacts || contacts.length === 0)) ||
    (userType === 'customer' && (!contacts || contacts.length === 0));

  // Customize empty state message based on user type
  const getEmptyStateMessage = () => {
    if (userType === 'craftsman') {
      return {
        title: "Zatiaľ nemáte žiadne správy",
        description: "Konverzácie sa zobrazia, keď vám zákazníci pošlú správy. Zákazníci môžu iniciovať konverzácie z vášho profilu."
      };
    } else {
      return {
        title: "Zatiaľ nemáte žiadne správy",
        description: "Konverzácie sa zobrazia, keď začnete komunikovať s remeselníkmi. Môžete iniciovať konverzácie z profilu remeselníka."
      };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Správy</h1>
        </div>
        
        {showEmptyStateMessage ? (
          <div className="bg-white rounded-lg shadow-sm p-10 h-[75vh] flex flex-col items-center justify-center text-center">
            <div className="max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{emptyState.title}</h2>
              <p className="text-gray-600 mb-6">
                {emptyState.description}
              </p>
            </div>
          </div>
        ) : (
          <Chat />
        )}
      </div>
    </Layout>
  );
};

export default Messages;
