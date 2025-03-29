import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, Phone, Mail, Calendar, MessageSquare, Clock, ThumbsUp, Loader2, Image, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import EditProfileForm from "@/components/EditProfileForm";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

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
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-profile-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      // Update profile with the new image URL
      let updateTable = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      
      const { error: updateError } = await supabase
        .from(updateTable)
        .update({ profile_image_url: data.publicUrl })
        .eq('id', user?.id);
        
      if (updateError) {
        throw updateError;
      }
      
      setProfileImageUrl(data.publicUrl);
      toast.success("Profilový obrázok bol aktualizovaný");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Nastala chyba pri nahrávaní obrázka");
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || userType !== 'craftsman') {
      return;
    }
    
    const files = Array.from(event.target.files);
    setUploading(true);
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}-portfolio-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('profile_images')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data } = supabase.storage
          .from('profile_images')
          .getPublicUrl(filePath);
          
        // Insert into portfolio_images table
        const { error: insertError } = await supabase
          .from('portfolio_images')
          .insert({
            craftsman_id: user?.id,
            image_url: data.publicUrl,
            title: 'Moja práca'
          });
          
        if (insertError) {
          throw insertError;
        }
      }
      
      // Refresh portfolio images
      fetchPortfolioImages(user?.id as string);
      toast.success("Obrázky boli pridané do portfólia");
    } catch (error) {
      console.error('Error uploading portfolio images:', error);
      toast.error("Nastala chyba pri nahrávaní obrázkov");
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const fetchPortfolioImages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('craftsman_id', userId);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setPortfolioImages(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
    }
  };

  const fetchUserType = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user type:', error);
        return null;
      }
      
      return data.user_type;
    } catch (error) {
      console.error('Error in fetchUserType:', error);
      return null;
    }
  };

  const fetchProfileData = async (userId: string, type: string) => {
    try {
      const table = type === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error(`Error fetching ${type} profile:`, error);
        throw error;
      }
      
      setProfileData(data);
      setProfileImageUrl(data.profile_image_url);
      
      if (type === 'craftsman') {
        fetchPortfolioImages(userId);
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
        
        // Fetch user type
        const type = await fetchUserType(profileId);
        setUserType(type);
        
        if (type) {
          // Fetch profile data based on user type
          await fetchProfileData(profileId, type);
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
  }, [id, user, navigate, uiToast]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
        <div className="bg-white border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div className="relative w-48 h-48 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={profileData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-24 h-24 text-gray-300" />
                    </div>
                  )}
                  
                  {isCurrentUser && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <label htmlFor="profile-image-upload" className="cursor-pointer flex flex-col items-center justify-center text-white">
                        <UploadCloud className="w-8 h-8 mb-2" />
                        <span className="text-sm">Nahrať fotku</span>
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-2/3 text-center md:text-left">
                {isCurrentUser && !isEditing && (
                  <Button 
                    variant="outline" 
                    className="mb-4"
                    onClick={() => setIsEditing(true)}
                  >
                    Upraviť profil
                  </Button>
                )}
                
                {isEditing && profileData ? (
                  <div className="mb-6">
                    <EditProfileForm 
                      profile={profileData} 
                      userType={userType}
                      onUpdate={handleProfileUpdate} 
                    />
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setIsEditing(false)}
                    >
                      Zrušiť
                    </Button>
                  </div>
                ) : (
                  <>
                    {userType === 'craftsman' && (
                      <div className="inline-block mb-3 px-3 py-1 bg-black/5 backdrop-blur-sm text-sm font-medium rounded-full">
                        {profileData.trade_category}
                      </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {profileData.name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start mb-4">
                      {userType === 'craftsman' && (
                        <div className="flex items-center mr-4">
                          <Star className="w-5 h-5 fill-current text-yellow-500 mr-1" />
                          <span className="font-semibold">4.8</span>
                          <span className="text-muted-foreground ml-1">
                            (24 hodnotení)
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {profileData.location}
                        </span>
                      </div>
                    </div>
                    {userType === 'craftsman' && profileData.description && (
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto md:mx-0">
                        {profileData.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Button className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Kontaktovať
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Správa
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-3 mb-8">
              <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
              <TabsTrigger value="reviews">Hodnotenia</TabsTrigger>
              <TabsTrigger value="contact">Kontakt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="animate-fade-in">
              {userType === 'craftsman' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white rounded-lg overflow-hidden border border-border/50 shadow-sm">
                    {portfolioImages.length > 0 ? (
                      <img
                        src={portfolioImages[activeImageIndex]?.image_url || 'https://images.unsplash.com/photo-1565372781813-6e4d12fd2b12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
                        alt="Featured work"
                        className="w-full h-96 object-cover object-center transform transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100">
                        <Image className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">Žiadne obrázky v portfóliu</p>
                        {isCurrentUser && (
                          <label htmlFor="portfolio-images-upload" className="mt-4 cursor-pointer">
                            <Button>
                              <UploadCloud className="mr-2 h-4 w-4" />
                              Pridať obrázky
                            </Button>
                            <input
                              id="portfolio-images-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handlePortfolioImageUpload}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Ukážky prác</h3>
                      {isCurrentUser && portfolioImages.length > 0 && (
                        <label htmlFor="portfolio-images-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Pridať ďalšie
                          </Button>
                          <input
                            id="portfolio-images-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handlePortfolioImageUpload}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                    
                    {portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {portfolioImages.map((image, index) => (
                          <div
                            key={index}
                            className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                              index === activeImageIndex
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent"
                            }`}
                            onClick={() => handleImageClick(index)}
                          >
                            <img
                              src={image.image_url}
                              alt={`Work sample ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      isCurrentUser && (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-center text-gray-500 mb-4">
                            Ukážte svoje práce potenciálnym zákazníkom
                          </p>
                          <label htmlFor="portfolio-images-upload-2" className="cursor-pointer">
                            <Button>Nahrať obrázky do portfólia</Button>
                            <input
                              id="portfolio-images-upload-2"
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handlePortfolioImageUpload}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      )
                    )}
                    
                    {userType === 'craftsman' && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Špecializácia</h3>
                        <div className="flex flex-wrap gap-2">
                          <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                            {profileData.trade_category}
                          </div>
                          {profileData.years_experience && (
                            <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                              {profileData.years_experience} rokov skúseností
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <h3 className="text-xl font-semibold mb-4">Zákazník</h3>
                  <p>Toto je profil zákazníka, ktorý vyhľadáva služby remeselníkov.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold mb-6">Hodnotenia klientov</h3>
                  
                  <div className="space-y-6">
                    {userType === 'craftsman' ? (
                      <>
                        <Card className="border border-border/50">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">Tomáš Novák</h4>
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < 5
                                          ? "fill-current text-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                18.04.2023
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              Výborne spravená práca. Profesionálny prístup, presné dodržanie termínov a výborný výsledok.
                            </p>
                            <div className="flex justify-end mt-4">
                              <Button variant="ghost" size="sm" className="text-xs">
                                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                                Užitočné
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border border-border/50">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">Jana Kováčová</h4>
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < 5
                                          ? "fill-current text-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                02.03.2023
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              Kvalitný materiál, precízne prevedenie a rýchla práca. Určite odporúčam!
                            </p>
                            <div className="flex justify-end mt-4">
                              <Button variant="ghost" size="sm" className="text-xs">
                                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                                Užitočné
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-lg">
                        <p>Tento užívateľ nemá zatiaľ žiadne hodnotenia.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Card className="border border-border/50">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Pridať hodnotenie</h3>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Vaše hodnotenie
                          </label>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => handleStarClick(value)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    value <= rating
                                      ? "fill-current text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="comment"
                            className="block text-sm font-medium mb-2"
                          >
                            Vaša recenzia
                          </label>
                          <textarea
                            id="comment"
                            rows={4}
                            className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Popíšte vašu skúsenosť s týmto remeselníkom..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                          ></textarea>
                        </div>
                        <Button type="submit" className="w-full">
                          Odoslať hodnotenie
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Kontaktné informácie</h3>
                    <div className="space-y-4">
                      {profileData.phone && (
                        <div className="flex items-start">
                          <Phone className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                          <div>
                            <p className="font-medium">Telefón</p>
                            <p className="text-muted-foreground">
                              {profileData.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">
                            {profileData.email}
                          </p>
                        </div>
                      </div>
                      {userType === 'craftsman' && (
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                          <div>
                            <p className="font-medium">Dostupnosť</p>
                            <p className="text-muted-foreground">
                              Pondelok - Piatok, 8:00 - 17:00
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">Región pôsobenia</p>
                          <p className="text-muted-foreground">
                            {profileData.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Poslať správu</h3>
                    <form className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium mb-2"
                        >
                          Vaše meno
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Zadajte vaše meno"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium mb-2"
                        >
                          Váš email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Zadajte váš email"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium mb-2"
                        >
                          Správa
                        </label>
                        <textarea
                          id="message"
                          rows={4}
                          className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Opíšte vašu požiadavku..."
                        ></textarea>
                      </div>
                      <Button type="submit" className="w-full">
                        Odoslať správu
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
