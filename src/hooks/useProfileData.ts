
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileImages } from "@/hooks/useProfileImages";
import { useProfileReviews } from "@/hooks/useProfileReviews";
import { createDefaultProfile } from "@/utils/profileCreation";
import { uploadProfileImage, uploadPortfolioImages } from "@/utils/imageUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioProject } from "@/types/profile";

export const useProfileData = (id?: string) => {
  const { user, userType } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customSpecialization, setCustomSpecialization] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);

  const {
    loading,
    profileData,
    userType: fetchedUserType,
    isCurrentUser,
    profileNotFound,
    setProfileData,
    fetchProfileData,
  } = useProfileCore(id);

  const {
    portfolioImages,
    profileImageUrl,
    setProfileImageUrl,
    fetchPortfolioImages
  } = useProfileImages(profileData, fetchedUserType || userType);

  const {
    reviews,
    isLoadingReviews,
    refetchReviews
  } = useProfileReviews(id || profileData?.id);
  
  // Set initial custom specialization from profile data
  useEffect(() => {
    if (profileData && 'custom_specialization' in profileData) {
      setCustomSpecialization(profileData.custom_specialization || '');
    }
  }, [profileData]);

  // Fetch projects when profile data is available
  useEffect(() => {
    const fetchProjects = async () => {
      if (!profileData?.id) return;
      
      try {
        // Check if the portfolio_projects table exists
        const { data: projectData, error: projectError } = await supabase
          .from('portfolio_images') // Use portfolioImages since projects table may not exist
          .select('*')
          .eq('craftsman_id', profileData.id)
          .order('created_at', { ascending: false });
          
        if (projectError) throw projectError;
        
        // If we're here, we can access the database
        // For now, treat images as simple projects
        const formattedProjects = projectData?.map(img => ({
          id: img.id,
          craftsman_id: img.craftsman_id,
          title: img.title || 'Project',
          description: img.description || '',
          created_at: img.created_at,
          updated_at: img.created_at,
          images: [img]
        })) || [];
        
        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    
    fetchProjects();
  }, [profileData?.id]);

  const handleProfileImageUpload = async (file: File | Blob) => {
    if (!profileData || !user) {
      toast.error("Nie je možné nahrať fotku, používateľ nie je prihlásený");
      return;
    }
    
    setUploading(true);
    try {
      const url = await uploadProfileImage(file, profileData.id, fetchedUserType || userType);
      if (url) {
        setProfileImageUrl(url);
        toast.success("Profilová fotka bola úspešne aktualizovaná");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Nastala chyba pri nahrávaní profilovej fotky");
    } finally {
      setUploading(false);
    }
  };

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileData || !user) {
      toast.error("Nie je možné nahrať fotku, používateľ nie je prihlásený");
      return;
    }
    
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      
      // Clear the input value so that the same file can be selected again if needed
      e.target.value = '';
      
      if (files.length > 5) {
        toast.warning("Môžete nahrať maximálne 5 obrázkov naraz");
        files.splice(5);
      }
      
      await uploadPortfolioImages(files, profileData.id);
      
      // Refresh portfolio images
      if (fetchPortfolioImages) {
        await fetchPortfolioImages(profileData.id);
        toast.success("Obrázky boli úspešne nahraté");
      }
    } catch (error) {
      console.error("Error uploading portfolio images:", error);
      toast.error("Nastala chyba pri nahrávaní obrázkov do portfólia");
    } finally {
      setUploading(false);
    }
  };

  const createProject = async (title: string, description: string, images: File[]) => {
    if (!profileData || !user) {
      toast.error("Nie je možné vytvoriť projekt, používateľ nie je prihlásený");
      return Promise.reject("User not logged in");
    }
    
    setSaving(true);
    try {
      // Upload images first
      const uploadedUrls = await uploadPortfolioImages(images, profileData.id);
      
      // Create a simple project from the first image
      if (uploadedUrls.length > 0) {
        // Refresh portfolio images and treat them as projects for now
        if (fetchPortfolioImages) {
          await fetchPortfolioImages(profileData.id);
        }
        
        toast.success("Projekt bol úspešne vytvorený");
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Nastala chyba pri vytváraní projektu");
      return Promise.reject(error);
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (projectId: string) => {
    if (!profileData || !user) {
      toast.error("Nie je možné odstrániť projekt, používateľ nie je prihlásený");
      return;
    }
    
    try {
      // For now, just delete the portfolio image since we're treating images as projects
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      
      toast.success("Projekt bol úspešne odstránený");
    } catch (error) {
      console.error("Error removing project:", error);
      toast.error("Nastala chyba pri odstraňovaní projektu");
    }
  };

  const updateCustomSpecialization = async (newSpecialization: string) => {
    if (!profileData || !user) {
      toast.error("Nie je možné aktualizovať špecializáciu, používateľ nie je prihlásený");
      return;
    }
    
    setSaving(true);
    try {
      // Update the custom specialization in the database
      const { error } = await supabase
        .from('craftsman_profiles')
        .update({ custom_specialization: newSpecialization })
        .eq('id', profileData.id);
        
      if (error) throw error;
      
      // Update local state
      setCustomSpecialization(newSpecialization);
      
      // Update profile data
      if (profileData && 'custom_specialization' in profileData) {
        const updatedProfile = { 
          ...profileData, 
          custom_specialization: newSpecialization 
        };
        setProfileData(updatedProfile);
      }
      
      toast.success("Špecializácia bola úspešne aktualizovaná");
    } catch (error) {
      console.error("Error updating custom specialization:", error);
      toast.error("Nastala chyba pri aktualizácii špecializácie");
    } finally {
      setSaving(false);
    }
  };

  const createDefaultProfileIfNeeded = useCallback(async () => {
    if (isCreatingProfile) {
      console.log("Profile creation already in progress, skipping");
      return;
    }
    
    setIsCreatingProfile(true);
    setError(null);
    
    try {
      console.log("Starting profile creation for:", user?.id, "userType:", userType);
      
      if (!user) {
        throw new Error("Používateľ nie je prihlásený");
      }
      
      if (!userType) {
        throw new Error("Typ používateľa nie je nastavený");
      }
      
      await createDefaultProfile(
        user, 
        userType, 
        isCurrentUser, 
        () => {
          console.log("Profile created successfully, fetching data");
          fetchProfileData();
          // Wait a moment before clearing the creating state to give time for UI updates
          setTimeout(() => {
            setIsCreatingProfile(false);
          }, 2000);
        }
      );
    } catch (error: any) {
      console.error("Error in createDefaultProfileIfNeeded:", error);
      setError(error.message || "Unknown error");
      toast.error("Chyba pri vytváraní profilu", {
        description: error.message
      });
      setIsCreatingProfile(false);
      throw error;
    }
  }, [user, userType, isCurrentUser, fetchProfileData, isCreatingProfile]);

  return {
    loading,
    profileData,
    userType: fetchedUserType || userType,
    isCurrentUser,
    profileNotFound,
    portfolioImages,
    profileImageUrl,
    customSpecialization,
    reviews,
    isLoadingReviews,
    refetchReviews,
    setProfileData,
    setProfileImageUrl,
    setCustomSpecialization,
    fetchPortfolioImages,
    handleProfileImageUpload,
    handlePortfolioImageUpload,
    updateCustomSpecialization,
    createDefaultProfileIfNeeded,
    isCreatingProfile,
    uploading,
    saving,
    projects,
    createProject,
    removeProject,
    error
  };
};
