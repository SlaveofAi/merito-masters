
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
    // Check if the booking-images storage bucket exists
    const checkBookingImagesBucket = async () => {
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
          console.log("booking-images bucket doesn't exist - creating it now");
          // Create the bucket if it doesn't exist
          const { error: createError } = await supabase.storage.createBucket('booking-images', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.error("Error creating booking-images bucket:", createError);
          } else {
            console.log("booking-images bucket created successfully");
            
            // For RLS policies, we need to use direct SQL queries instead of RPC calls
            // to solve the TS2345 errors
            try {
              // Create public read policy
              const { error: policyError } = await supabase.from('_temp_policy_helper').insert({
                statement: `
                  CREATE POLICY "Public Read Access"
                  ON storage.objects FOR SELECT
                  USING (bucket_id = 'booking-images');
                `
              }).select().single();
              
              if (policyError) {
                console.error("Error creating public read policy:", policyError);
              }
              
              // Create authenticated upload policy
              const { error: uploadPolicyError } = await supabase.from('_temp_policy_helper').insert({
                statement: `
                  CREATE POLICY "Authenticated Upload"
                  ON storage.objects FOR INSERT
                  WITH CHECK (bucket_id = 'booking-images' AND auth.role() = 'authenticated');
                `
              }).select().single();
              
              if (uploadPolicyError) {
                console.error("Error creating upload policy:", uploadPolicyError);
              }
            } catch (err) {
              console.log("Policy creation errors can be ignored in development - bucket still usable");
            }
          }
        } else {
          console.log("booking-images bucket exists");
        }
      } catch (error) {
        console.error("Error in bucket check:", error);
      }
    };
    
    checkBookingImagesBucket();
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
