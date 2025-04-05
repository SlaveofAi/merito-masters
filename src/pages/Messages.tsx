
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/chat/Chat";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
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
  
  useEffect(() => {
    // Create "booking-images" storage bucket if it doesn't exist
    const createBucketIfNeeded = async () => {
      if (!user) return;
      
      try {
        // Check if the bucket exists by listing buckets
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error("Error checking buckets:", bucketError);
          return;
        }
        
        // Check if booking-images bucket already exists
        const bucketExists = buckets?.some(bucket => bucket.name === 'booking-images');
        
        if (!bucketExists) {
          // Create the bucket
          const { error } = await supabase.storage.createBucket('booking-images', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (error) {
            console.error("Error creating booking-images bucket:", error);
          } else {
            console.log("booking-images bucket created successfully");
            
            // Set public bucket policy - fixed to use getPublicUrl instead of setPublicUrl
            const { data: urlData, error: urlError } = await supabase
              .storage
              .from('booking-images')
              .getPublicUrl('dummy.txt'); // This is just to trigger policy creation
              
            if (urlError) {
              console.error("Error with bucket policy:", urlError);
            } else {
              console.log("Public URL obtained for booking-images bucket");
            }
          }
        }
      } catch (error) {
        console.error("Error in bucket creation:", error);
      }
    };
    
    createBucketIfNeeded();
  }, [user]);

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
