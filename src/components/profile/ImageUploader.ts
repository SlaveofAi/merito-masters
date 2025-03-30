
import { toast } from "sonner";
import { uploadProfileImage, uploadPortfolioImages } from "@/utils/imageUpload";

export const useImageUploader = (
  userId: string, 
  userType: string | null,
  onProfileImageUploaded: (url: string) => void,
  onPortfolioImagesUploaded: () => void
) => {
  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !userId) {
      return;
    }
    
    const file = event.target.files[0];
    
    try {
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
