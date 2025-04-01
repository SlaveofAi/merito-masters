
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
    const fileName = `profile-${userId}-${Math.random().toString(36).substring(2)}.jpg`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, file, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }
    
    const { data } = supabase.storage
      .from('profile_images')
      .getPublicUrl(filePath);
    
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
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error("Nastala chyba pri nahrávaní obrázka");
    return null;
  }
};

export const uploadPortfolioImages = async (files: File[], userId: string) => {
  const uploadedUrls: string[] = [];
  
  try {
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-portfolio-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
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
      
      uploadedUrls.push(data.publicUrl);
    }
    
    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'obrázok bol nahratý' : 'obrázky boli nahraté'}`);
    }
    
    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading portfolio images:', error);
    toast.error("Nastala chyba pri nahrávaní obrázkov");
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
