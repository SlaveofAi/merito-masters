
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
    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 5MB.");
      return null;
    }

    // Generate unique filename to avoid caching issues
    const timestamp = new Date().getTime();
    const fileName = `profile-${userId}-${timestamp}-${Math.random().toString(36).substring(2)}.jpg`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, file, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: 'no-cache' // Prevent caching
      });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }
    
    // Add a cache-busting parameter to the URL
    const { data } = supabase.storage
      .from('profile_images')
      .getPublicUrl(`${filePath}?t=${timestamp}`);
    
    const tableToUpdate = userType === 'craftsman' ? TABLES.CRAFTSMAN_PROFILES : TABLES.CUSTOMER_PROFILES;
    
    const { error: updateError } = await supabase
      .from(tableToUpdate)
      .update({ profile_image_url: data.publicUrl })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }
    
    toast.success("Profilová fotka bola aktualizovaná");
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    toast.error(`Nastala chyba pri nahrávaní obrázka: ${error.message || 'Neznáma chyba'}`);
    return null;
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
