
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
  const [processingContact, setProcessingContact] = useState(false);
  const { contacts, contactsLoading, refetchContacts } = useContacts();
  
  // Get contact and conversation IDs from URL if present
  const contactId = searchParams.get('contact');
  const conversationId = searchParams.get('conversation');

  // Process contact data if provided in URL
  useEffect(() => {
    const processContactData = async () => {
      if (!user || !contactId || processingContact) return;
      
      try {
        setProcessingContact(true);
        console.log(`Processing contact data for contact ID: ${contactId}, conversation ID: ${conversationId}`);
        
        // Fetch the contact's profile data to get their name
        const contactTypeTable = userType === 'customer' ? 'craftsman_profiles' : 'customer_profiles';
        const { data: contactData, error: contactError } = await supabase
          .from(contactTypeTable)
          .select('id, name, profile_image_url, user_type')
          .eq('id', contactId)
          .single();
          
        if (contactError || !contactData) {
          console.error("Error fetching contact data:", contactError);
          
          // Try the other profile type as fallback
          const fallbackTable = userType === 'customer' ? 'customer_profiles' : 'craftsman_profiles';
          const { data: fallbackData, error: fallbackError } = await supabase
            .from(fallbackTable)
            .select('id, name, profile_image_url, user_type')
            .eq('id', contactId)
            .single();
            
          if (fallbackError || !fallbackData) {
            console.error("Error fetching fallback contact data:", fallbackError);
            toast.error("Nepodarilo sa načítať údaje kontaktu");
            return;
          }
          
          console.log("Contact data found in fallback table:", fallbackData);
          // Store user in localStorage for Chat component
          localStorage.setItem('selectedContact', JSON.stringify({
            id: fallbackData.id,
            contactId: fallbackData.id,
            name: fallbackData.name,
            avatar_url: fallbackData.profile_image_url,
            user_type: fallbackData.user_type || (userType === 'customer' ? 'craftsman' : 'customer'),
            conversation_id: conversationId
          }));
          
        } else {
          console.log("Contact data found:", contactData);
          // Store contact in localStorage for Chat component
          localStorage.setItem('selectedContact', JSON.stringify({
            id: contactData.id,
            contactId: contactData.id,
            name: contactData.name,
            avatar_url: contactData.profile_image_url,
            user_type: contactData.user_type || (userType === 'customer' ? 'craftsman' : 'customer'),
            conversation_id: conversationId
          }));
        }
        
        // Trigger a refetch to make sure contacts list is updated
        refetchContacts();
        
      } catch (error) {
        console.error("Error processing contact data:", error);
        toast.error("Nastala chyba pri spracovaní údajov kontaktu");
      } finally {
        setProcessingContact(false);
      }
    };
    
    if (contactId && user && !loading) {
      processContactData();
    }
  }, [contactId, conversationId, user, loading, userType, processingContact, refetchContacts]);

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

  // Determine if we should show the Chat component, even if there are no contacts
  // but we have a contact parameter in the URL
  const hasContactParam = !!contactId;
  const showEmptyStateMessage = !hasContactParam && (!contacts || contacts.length === 0);

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
