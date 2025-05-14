
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileImages } from "@/hooks/useProfileImages";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useProfileData = (id: string | undefined) => {
  // Get auth state
  const { user, userType } = useAuth();
  
  // Get core profile handling
  const {
    profile,
    isCurrentUser,
    isLoading,
    error,
    refetchProfile
  } = useProfileCore(id);

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Get profile image handling
  const { uploadProfileImage } = useProfileImages();

  // Set initial form data when profile loads
  useEffect(() => {
    if (profile && !formData) {
      setFormData({ ...profile });
      setProfileImageUrl(profile.profile_image_url);
    }
  }, [profile, formData]);

  // Reset form when editing is toggled off
  useEffect(() => {
    if (!isEditing && profile) {
      setFormData({ ...profile });
    }
  }, [isEditing, profile]);

  // Handle form input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !user || !userType) return;
    
    try {
      setUpdating(true);
      
      // Determine which table to update
      const table = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      
      const { error } = await supabase
        .from(table)
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          location: formData.location,
          ...(userType === 'craftsman' ? {
            description: formData.description,
            trade_category: formData.trade_category,
            years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
            custom_specialization: formData.custom_specialization || null
          } : {})
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Refetch profile data
      refetchProfile();
      setIsEditing(false);
      toast.success("Profil bol úspešne aktualizovaný");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Nastala chyba pri aktualizácii profilu");
    } finally {
      setUpdating(false);
    }
  }, [formData, user, userType, refetchProfile]);

  // Handle profile image upload
  const handleProfileImageUpload = useCallback(async (file: File): Promise<void> => {
    try {
      if (!user || !userType) {
        throw new Error("User not authenticated");
      }
      
      const url = await uploadProfileImage(file, userType, user.id);
      
      if (url) {
        setProfileImageUrl(url);
        toast.success("Profilová fotka bola úspešne aktualizovaná");
        return Promise.resolve();
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Nastala chyba pri nahrávaní profilovej fotky");
      return Promise.reject(error);
    }
  }, [user, userType, uploadProfileImage]);

  // Function to fetch profile data again - needed for ProfileContext
  const fetchProfileData = useCallback(() => {
    refetchProfile();
  }, [refetchProfile]);

  return {
    profile,
    formData,
    isCurrentUser,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    handleChange,
    handleSubmit,
    updating,
    profileImageUrl,
    handleProfileImageUpload,
    fetchProfileData,
  };
};
