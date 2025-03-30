import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProfileData, CraftsmanProfile, CustomerProfile } from "@/types/profile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PortfolioTab from "@/components/profile/PortfolioTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import ContactTab from "@/components/profile/ContactTab";
import { 
  TABLES, 
  uploadProfileImage, 
  uploadPortfolioImages, 
  fetchPortfolioImages as fetchPortfolioImagesUtil 
} from "@/utils/imageUpload";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { user, userType: authUserType } = useAuth();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Hodnotenie bolo odoslané", {
      description: "Ďakujeme za vaše hodnotenie",
    });
    setRating(0);
    setReviewComment("");
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfileData({...profileData, ...updatedProfile});
    setIsEditing(false);
    toast.success("Profil bol aktualizovaný");
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    
    const file = event.target.files[0];
    setUploading(true);
    
    try {
      const imageUrl = await uploadProfileImage(file, user.id, userType);
      if (imageUrl) {
        setProfileImageUrl(imageUrl);
        toast.success("Profilový obrázok bol aktualizovaný");
      }
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || userType !== 'craftsman' || !user) {
      return;
    }
    
    const files = Array.from(event.target.files);
    setUploading(true);
    
    try {
      await uploadPortfolioImages(files, user.id);
      fetchPortfolioImages(user.id);
      toast.success("Obrázky boli pridané do portfólia");
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const fetchPortfolioImages = async (userId: string) => {
    const images = await fetchPortfolioImagesUtil(userId);
    setPortfolioImages(images);
  };

  const fetchUserType = async (userId: string) => {
    try {
      if (authUserType && userId === user?.id) {
        console.log("Using user type from auth context:", authUserType);
        return authUserType;
      }

      const { data, error } = await supabase
        .from(TABLES.USER_TYPES)
        .select('user_type')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user type:', error);
        return null;
      }
      
      return data?.user_type || null;
    } catch (error) {
      console.error('Error in fetchUserType:', error);
      return null;
    }
  };

  const fetchProfileData = async (userId: string, type: string) => {
    try {
      const table = type === 'craftsman' ? TABLES.CRAFTSMAN_PROFILES : TABLES.CUSTOMER_PROFILES;
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error(`Error fetching ${type} profile:`, error);
        
        if (userId === user?.id) {
          setProfileNotFound(true);
        } else {
          throw error;
        }
      }
      
      if (data) {
        setProfileData(data as ProfileData);
        
        if ('profile_image_url' in data) {
          setProfileImageUrl(data.profile_image_url);
        }
        
        if (type === 'craftsman') {
          fetchPortfolioImages(userId);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      toast.error("Nastala chyba pri načítaní profilu");
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        
        if (!user) {
          uiToast({
            title: "Nie ste prihlásený",
            description: "Pre zobrazenie profilu sa musíte prihlásiť",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const currentUserId = user.id;
        const profileId = id || currentUserId;
        
        setIsCurrentUser(currentUserId === profileId);
        
        const type = await fetchUserType(profileId);
        setUserType(type);
        
        if (type) {
          await fetchProfileData(profileId, type);
        } else if (isCurrentUser) {
          setProfileNotFound(true);
          uiToast({
            title: "Upozornenie",
            description: "Váš profil nie je úplný. Prosím, dokončite registráciu.",
            variant: "destructive",
          });
        } else {
          uiToast({
            title: "Chyba",
            description: "Nepodarilo sa načítať typ užívateľa",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error in profile page:", error);
        uiToast({
          title: "Chyba",
          description: "Nastala chyba pri načítaní profilu",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [id, user, navigate, uiToast, authUserType, isCurrentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (profileNotFound && isCurrentUser) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Váš profil nie je úplný</h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Zdá sa, že registrácia nebola úplne dokončená. Môžete sa skúsiť odhlásiť a prihlásiť znova, 
            alebo sa obrátiť na podporu.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
            >
              Späť na domovskú stránku
            </Button>
            <Button onClick={() => window.location.reload()}>
              Obnoviť stránku
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Profil nebol nájdený</h1>
          <Button onClick={() => navigate("/")}>Späť na domovskú stránku</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/30">
        <ProfileHeader 
          profileData={profileData}
          userType={userType}
          isCurrentUser={isCurrentUser}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          profileImageUrl={profileImageUrl}
          handleProfileImageUpload={handleProfileImageUpload}
          uploading={uploading}
          handleProfileUpdate={handleProfileUpdate}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-3 mb-8">
              <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
              <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
              <TabsTrigger value="contact">Kontakt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="animate-fade-in">
              <PortfolioTab 
                userType={userType}
                isCurrentUser={isCurrentUser}
                portfolioImages={portfolioImages}
                profileData={profileData}
                activeImageIndex={activeImageIndex}
                handleImageClick={handleImageClick}
                handlePortfolioImageUpload={handlePortfolioImageUpload}
                uploading={uploading}
              />
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <ReviewsTab 
                userType={userType}
                rating={rating}
                reviewComment={reviewComment}
                handleStarClick={handleStarClick}
                setReviewComment={setReviewComment}
                handleSubmitReview={handleSubmitReview}
              />
            </TabsContent>
            
            <TabsContent value="contact" className="animate-fade-in">
              <ContactTab 
                profileData={profileData}
                userType={userType}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
