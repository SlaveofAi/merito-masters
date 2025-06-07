
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadChatImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    console.log(`Starting chat image upload for user ${userId}`);
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 5MB.");
      return null;
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error("Iba obrázky sú povolené.");
      return null;
    }

    // Generate unique filename
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `chat-${userId}-${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `chat_images/${fileName}`;
    
    console.log(`Uploading chat image to path: ${filePath}`);
    
    // Upload to the booking_images bucket (we'll reuse this bucket for chat images too)
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('booking_images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: 'no-cache'
      });
      
    if (uploadError) {
      console.error("Chat image upload error:", uploadError);
      
      // If bucket doesn't exist, try to create it
      if (uploadError.message.includes('Bucket not found')) {
        console.log("Bucket not found, this should be handled by the migration");
        toast.error("Chyba pri nahrávaní: Storage bucket neexistuje.");
        return null;
      }
      
      toast.error(`Chyba pri nahrávaní obrázka: ${uploadError.message}`);
      return null;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('booking_images')
      .getPublicUrl(filePath);
    
    if (!data || !data.publicUrl) {
      console.error("Failed to get public URL for uploaded chat image");
      toast.error("Chyba: Nepodarilo sa získať URL obrázka.");
      return null;
    }
    
    // Add cache-busting parameter
    const publicUrl = `${data.publicUrl}?t=${timestamp}`;
    console.log("Chat image uploaded successfully:", publicUrl);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading chat image:', error);
    toast.error(`Nastala chyba pri nahrávaní obrázka: ${error.message || 'Neznáma chyba'}`);
    return null;
  }
};
