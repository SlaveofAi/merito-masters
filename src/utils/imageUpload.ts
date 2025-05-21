import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TABLES = {
  CRAFTSMAN_PROFILES: 'craftsman_profiles' as const,
  CUSTOMER_PROFILES: 'customer_profiles' as const,
  USER_TYPES: 'user_types' as const,
  PORTFOLIO_IMAGES: 'portfolio_images' as const
};

export const uploadProfileImage = async (file: File | Blob, userId: string, userType: string | null) => {
  try {
    console.log(`Starting image upload for user ${userId} with type ${userType}`);
    
    if (!userType) {
      console.error("User type is required for profile image upload");
      toast.error("Chyba: Typ užívateľa nie je definovaný.");
      return null;
    }
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 5MB.");
      return null;
    }

    // --- BUCKET MANAGEMENT ---
    // First attempt to force create the bucket if it doesn't exist
    try {
      console.log("Creating profile_images bucket if it doesn't exist");
      
      const { error: createError } = await supabase.storage
        .createBucket('profile_images', { 
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
      if (createError && !createError.message.includes("already exists")) {
        console.error("Error creating bucket:", createError);
      } else {
        console.log("Bucket creation succeeded or bucket already exists");
      }
    } catch (bucketError) {
      console.log("Bucket creation attempt caught error:", bucketError);
      // Continue anyway, we'll try uploading
    }

    // Generate unique filename to avoid caching issues
    const timestamp = new Date().getTime();
    const fileName = `profile-${userId}-${timestamp}-${Math.random().toString(36).substring(2)}.jpg`;
    const filePath = `${fileName}`;
    
    console.log(`Attempting to upload file to path: ${filePath} in bucket: profile_images`);
    
    // Now upload the file - with multiple retries if needed
    let uploadAttempt = 0;
    let uploadSuccess = false;
    let uploadData = null;
    let uploadError = null;
    
    while (!uploadSuccess && uploadAttempt < 3) {
      uploadAttempt++;
      console.log(`Upload attempt ${uploadAttempt}`);
      
      try {
        const result = await supabase.storage
          .from('profile_images')
          .upload(filePath, file, {
            contentType: 'image/jpeg',
            upsert: true,
            cacheControl: 'no-cache' // Prevent caching
          });
          
        uploadError = result.error;
        uploadData = result.data;
        
        if (!uploadError) {
          uploadSuccess = true;
          console.log("File uploaded successfully on attempt", uploadAttempt);
        } else {
          console.error(`Upload error (attempt ${uploadAttempt}):`, uploadError);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error(`Upload exception (attempt ${uploadAttempt}):`, err);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!uploadSuccess) {
      console.error("All upload attempts failed");
      toast.error(`Chyba pri nahrávaní: ${uploadError?.message || "Neznáma chyba"}`);
      return null;
    }
    
    // Get the public URL for the uploaded image
    const { data } = supabase.storage
      .from('profile_images')
      .getPublicUrl(`${filePath}`);
    
    if (!data || !data.publicUrl) {
      console.error("Failed to get public URL for uploaded image");
      toast.error("Chyba: Nepodarilo sa získať URL obrázka.");
      return null;
    }
    
    // Add a cache-busting parameter to the URL
    const publicUrl = `${data.publicUrl}?t=${timestamp}`;
    console.log("Generated public URL:", publicUrl);
    
    // Determine which table to update based on user type
    const tableToUpdate = userType.toLowerCase() === 'craftsman' 
      ? TABLES.CRAFTSMAN_PROFILES 
      : TABLES.CUSTOMER_PROFILES;
    
    console.log(`Updating ${tableToUpdate} for user ${userId} with image URL: ${publicUrl}`);
    
    // Update the profile_image_url in the database
    const { error: updateError } = await supabase
      .from(tableToUpdate)
      .update({ profile_image_url: publicUrl })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Database update error:", updateError);
      toast.error(`Chyba pri aktualizácii profilu: ${updateError.message}`);
      return null;
    }
    
    console.log("Profile image updated successfully in database");
    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    toast.error(`Nastala chyba pri nahrávaní obrázka: ${error.message || 'Neznáma chyba'}`);
    return null;
  }
};

// Helper function to ensure a bucket exists before using it
const ensureStorageBucketExists = async (bucketName: string) => {
  try {
    console.log(`Checking if storage bucket ${bucketName} exists`);
    
    // First check if bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage
      .getBucket(bucketName);
      
    if (bucketError) {
      console.log(`Bucket error for ${bucketName}:`, bucketError);
      
      if (bucketError.message.includes("does not exist")) {
        console.log(`Bucket ${bucketName} doesn't exist, creating it now`);
        
        // Create the bucket
        const { error: createBucketError } = await supabase.storage
          .createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
          
        if (createBucketError) {
          console.error(`Error creating bucket ${bucketName}:`, createBucketError);
          throw new Error(`Failed to create storage bucket: ${createBucketError.message}`);
        }
        
        // Add public policy to the bucket
        await setupBucketPolicies(bucketName);
        
        console.log(`Successfully created bucket ${bucketName} and set up policies`);
      } else {
        throw bucketError;
      }
    } else {
      console.log(`Bucket ${bucketName} exists`);
    }
    
    return true;
  } catch (error: any) {
    console.error(`Error ensuring storage bucket ${bucketName} exists:`, error);
    throw error;
  }
};

// Helper function to set up policies for a bucket
const setupBucketPolicies = async (bucketName: string) => {
  try {
    console.log(`Setting up policies for bucket ${bucketName}`);
    
    // Create policy for public read access
    const { error: readPolicyError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl('dummy.txt', 1); // This is just to test if policies are working
      
    if (readPolicyError && !readPolicyError.message.includes('The resource was not found')) {
      console.error(`Error testing bucket ${bucketName} policies:`, readPolicyError);
    }
    
    return true;
  } catch (error: any) {
    console.error(`Error setting up policies for bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadPortfolioImages = async (files: File[], userId: string) => {
  const uploadedUrls: string[] = [];
  
  try {
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024); // 5MB limit
    if (oversizedFiles.length > 0) {
      toast.error("Niektoré obrázky sú príliš veľké. Maximálna veľkosť je 5MB.");
      // Filter out oversized files
      files = files.filter(file => file.size <= 5 * 1024 * 1024);
      if (files.length === 0) return [];
    }

    for (const file of files) {
      // Check if file name indicates it's an update to an existing image
      let existingImageId = null;
      if (file.name.startsWith('update_')) {
        const parts = file.name.split('_');
        if (parts.length > 1) {
          existingImageId = parts[1];
          console.log("Updating existing image:", existingImageId);
        }
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-portfolio-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, { 
          upsert: true 
        });
        
      if (uploadError) {
        console.error("Portfolio upload error:", uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      if (existingImageId) {
        // Update existing image record
        const { error: updateError } = await supabase
          .from(TABLES.PORTFOLIO_IMAGES)
          .update({
            image_url: data.publicUrl
          })
          .eq('id', existingImageId);
          
        if (updateError) {
          console.error("Portfolio DB update error:", updateError);
          throw updateError;
        }
      } else {
        // Insert new image record
        const { error: insertError } = await supabase
          .from(TABLES.PORTFOLIO_IMAGES)
          .insert({
            craftsman_id: userId,
            image_url: data.publicUrl,
            title: 'Moja práca'
          });
          
        if (insertError) {
          console.error("Portfolio DB insert error:", insertError);
          throw insertError;
        }
      }
      
      uploadedUrls.push(data.publicUrl);
    }
    
    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'obrázok bol nahratý' : 'obrázky boli nahraté'}`);
    }
    
    return uploadedUrls;
  } catch (error: any) {
    console.error('Error uploading portfolio images:', error);
    toast.error(`Nastala chyba pri nahrávaní obrázkov: ${error.message || 'Neznáma chyba'}`);
    return uploadedUrls;
  }
};

export const fetchPortfolioImages = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PORTFOLIO_IMAGES)
      .select('*')
      .eq('craftsman_id', userId);
      
    if (error) {
      console.error("Error fetching portfolio images:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching portfolio images:', error);
    return [];
  }
};
