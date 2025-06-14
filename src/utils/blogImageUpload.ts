
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadBlogImage = async (file: File): Promise<string | null> => {
  try {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Obrázok je príliš veľký. Maximálna veľkosť je 5MB.");
      return null;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Podporované sú len obrázkové súbory.");
      return null;
    }

    // Generate unique filename
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `blog-${timestamp}-${randomString}.${fileExt}`;
    const filePath = `images/${fileName}`;

    console.log("Uploading blog image:", fileName);

    // Upload to blog-images bucket
    const { error: uploadError, data } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error(`Chyba pri nahrávaní: ${uploadError.message}`);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      toast.error("Nepodarilo sa získať URL obrázka.");
      return null;
    }

    console.log("Blog image uploaded successfully:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading blog image:', error);
    toast.error(`Nastala chyba pri nahrávaní obrázka: ${error.message || 'Neznáma chyba'}`);
    return null;
  }
};

export const uploadFeaturedImage = async (file: File): Promise<string | null> => {
  try {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `featured-${timestamp}-${randomString}.${fileExt}`;
    const filePath = `featured/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  } catch (error: any) {
    console.error('Error uploading featured image:', error);
    toast.error(`Chyba pri nahrávaní obrázka: ${error.message}`);
    return null;
  }
};
