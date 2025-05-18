import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/chat/Chat";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useContacts } from "@/hooks/useContacts";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const { user, loading, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { contacts, contactsLoading, refetchContacts } = useContacts();

  // Extract contact information from URL parameters or location state
  const contactIdFromParams = searchParams.get('contact');
  const conversationIdFromParams = searchParams.get('conversation');
  const contactFromLocation = location.state?.contact;
  const redirectedFromProfile = location.state?.from === 'profile';

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

  // Check if we were redirected from another page with parameters
  useEffect(() => {
    if (user) {
      if (redirectedFromProfile && contactFromLocation) {
        console.log("Redirected from profile page with contact:", contactFromLocation);
        // This data will be handled in the Chat component
      } else if (location.state?.from === 'booking') {
        console.log("Redirected from booking page with conversation:", location.state);
        // This data will be handled in the Chat component
      }
      
      // If coming from either source, make sure contacts are refreshed
      if ((redirectedFromProfile && contactFromLocation) || 
          location.state?.from === 'booking' ||
          contactIdFromParams || 
          conversationIdFromParams) {
        refetchContacts();
      }
    }
  }, [location, user, redirectedFromProfile, contactFromLocation, contactIdFromParams, conversationIdFromParams, refetchContacts]);

  // Function to handle contact profile navigation - improved to directly navigate to the correct profile
  const handleContactProfileNavigation = (contactId: string) => {
    if (contactId) {
      console.log("Navigating to profile from Messages.tsx:", contactId);
      // Always navigate to the absolute path with the contact's specific ID
      navigate(`/profile/${contactId}`);
    }
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

  // Show empty state message for both craftsmen with no contacts and customers with no conversations
  const showEmptyStateMessage = !contacts || contacts.length === 0;

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
        description: "Aby ste mohli začať konverzáciu, musíte najprv poslať správu remeselníkovi z jeho profilu."
      };
    }
  };

  const emptyState = getEmptyStateMessage();

  // If we have a contact from profile navigation but no matching contact in the contacts list,
  // we'll need to create a synthetic contact for initial message sending
  const initialContact = redirectedFromProfile && contactFromLocation ? contactFromLocation : null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Správy</h1>
        </div>
        
        {showEmptyStateMessage && !initialContact && !contactIdFromParams ? (
          <div className="bg-white rounded-lg shadow-sm p-10 h-[75vh] flex flex-col items-center justify-center text-center">
            <div className="max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{emptyState.title}</h2>
              <p className="text-gray-600 mb-6">
                {emptyState.description}
              </p>
            </div>
          </div>
        ) : (
          <Chat 
            onContactNameClick={handleContactProfileNavigation} 
            initialContact={initialContact}
            contactIdFromUrl={contactIdFromParams}
          />
        )}
      </div>
    </Layout>
  );
};

export default Messages;
