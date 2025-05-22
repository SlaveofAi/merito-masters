
import { toast } from "sonner";
import { uploadProfileImage, uploadPortfolioImages } from "@/utils/imageUpload";
import { supabase } from "@/integrations/supabase/client";

export const useImageUploader = (
  userId: string, 
  userType: string | null,
  onProfileImageUploaded: (url: string) => void,
  onPortfolioImagesUploaded: () => void
) => {
  // Verify profile exists before uploading
  const verifyProfileExists = async (): Promise<boolean> => {
    if (!userId || !userType) return false;
    
    try {
      const table = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error(`Error verifying profile existence: ${error.message}`);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('Error in verifyProfileExists:', err);
      return false;
    }
  };
  
  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !userId) {
      return;
    }
    
    const file = event.target.files[0];
    
    try {
      // First verify that the profile exists
      const profileExists = await verifyProfileExists();
      
      if (!profileExists) {
        toast.error("Profil nebol nájdený. Skúste sa odhlásiť a znova prihlásiť.");
        event.target.value = '';
        return;
      }
      
      const imageUrl = await uploadProfileImage(file, userId, userType);
      if (imageUrl) {
        onProfileImageUploaded(imageUrl);
        toast.success("Profilový obrázok bol aktualizovaný");
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error("Nastala chyba pri nahrávaní obrázka");
    } finally {
      event.target.value = '';
    }
  };

  const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || userType !== 'craftsman' || !userId) {
      return;
    }
    
    const files = Array.from(event.target.files);
    
    try {
      // First verify that the profile exists
      const profileExists = await verifyProfileExists();
      
      if (!profileExists) {
        toast.error("Profil remeselníka nebol nájdený. Skúste sa odhlásiť a znova prihlásiť.");
        event.target.value = '';
        return;
      }
      
      await uploadPortfolioImages(files, userId);
      onPortfolioImagesUploaded();
      toast.success("Obrázky boli pridané do portfólia");
    } catch (error) {
      console.error('Error uploading portfolio images:', error);
      toast.error("Nastala chyba pri nahrávaní obrázkov");
    } finally {
      event.target.value = '';
    }
  };

  return {
    handleProfileImageUpload,
    handlePortfolioImageUpload
  };
};
