import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Phone, Mail, Calendar, MessageSquare, Clock, ThumbsUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditProfileForm from "@/components/EditProfileForm";

const craftsman = {
  id: "1",
  name: "Martin Kováč",
  profession: "Stolár",
  location: "Bratislava",
  rating: 4.8,
  reviewCount: 24,
  description: "Profesionálny stolár s 15 ročnou praxou. Špecializujem sa na výrobe nábytku na mieru, kuchynské linky, vstavané skrine a drevené obklady. Používam kvalitné materiály a moderné technológie pre dosiahnutie najlepších výsledkov.",
  contact: {
    email: "martin.kovac@example.sk",
    phone: "+421 903 123 456",
    available: "Pondelok - Piatok, 8:00 - 17:00",
  },
  workImages: [
    "https://images.unsplash.com/photo-1565372781813-6e4d12fd2b12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595446468320-0ff8f329fe4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581858340520-b38dd852be58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1510466777733-8a3ea11298a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581537079326-108d2781efc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1609557080454-f5d713989a30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  ],
  reviews: [
    {
      id: "1",
      name: "Tomáš Novák",
      rating: 5,
      date: "18.04.2023",
      comment: "Výborne spravená práca. Martin vyrobil krásne schodisko pre náš rodinný dom. Profesionálny prístup, presné dodržanie termínov a výborný výsledok.",
    },
    {
      id: "2",
      name: "Jana Kováčová",
      rating: 5,
      date: "02.03.2023",
      comment: "Kuchynská linka presne podľa našich predstáv. Kvalitný materiál, precízne prevedenie a rýchla montáž. Určite odporúčam!",
    },
    {
      id: "3",
      name: "Peter Horváth",
      rating: 4,
      date: "15.01.2023",
      comment: "Spokojnosť s vyrobenou vstavanou skriňou. Drobné meškanie pri dodaní, ale výsledok stál za to.",
    },
  ],
};

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{id: string, name: string | null} | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Review submitted:", { rating, comment: reviewComment });
    setRating(0);
    setReviewComment("");
  };

  const handleProfileUpdate = (updatedProfile: {id: string, name: string | null}) => {
    setUserProfile(updatedProfile);
    setIsEditing(false);
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Nie ste prihlásený",
            description: "Pre zobrazenie profilu sa musíte prihlásiť",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const currentUserId = session.user.id;
        
        const profileId = id || currentUserId;
        
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("id", profileId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Chyba",
            description: "Nastala chyba pri načítaní profilu",
            variant: "destructive",
          });
          if (error.code === "PGRST116") {
            navigate("/");
          }
          return;
        }

        setUserProfile(profileData);
        setIsCurrentUser(currentUserId === profileId);
      } catch (error) {
        console.error("Error in profile page:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
                <div className="relative w-48 h-48 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                    alt={userProfile?.name || craftsman.name}
                    className="w-full h-full object-cover"
                  />
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
                
                {isEditing && userProfile ? (
                  <div className="mb-6">
                    <EditProfileForm 
                      profile={userProfile} 
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
                    <div className="inline-block mb-3 px-3 py-1 bg-black/5 backdrop-blur-sm text-sm font-medium rounded-full">
                      {craftsman.profession}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {userProfile?.name || craftsman.name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start mb-4">
                      <div className="flex items-center mr-4">
                        <Star className="w-5 h-5 fill-current text-yellow-500 mr-1" />
                        <span className="font-semibold">{craftsman.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground ml-1">
                          ({craftsman.reviewCount} hodnotení)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {craftsman.location}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto md:mx-0">
                      {craftsman.description}
                    </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white rounded-lg overflow-hidden border border-border/50 shadow-sm">
                  <img
                    src={craftsman.workImages[activeImageIndex]}
                    alt="Featured work"
                    className="w-full h-96 object-cover object-center transform transition-transform duration-500 hover:scale-105"
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Ukážky prác</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {craftsman.workImages.map((image, index) => (
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
                          src={image}
                          alt={`Work sample ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Špecializácia</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                        Výroba nábytku
                      </div>
                      <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                        Kuchynské linky
                      </div>
                      <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                        Vstavané skrine
                      </div>
                      <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                        Drevené obklady
                      </div>
                      <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                        Schody
                      </div>
                      <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                        Drevené dekorácie
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold mb-6">Hodnotenia klientov</h3>
                  
                  <div className="space-y-6">
                    {craftsman.reviews.map((review) => (
                      <Card key={review.id} className="border border-border/50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{review.name}</h4>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "fill-current text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5 mr-1.5" />
                              {review.date}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {review.comment}
                          </p>
                          <div className="flex justify-end mt-4">
                            <Button variant="ghost" size="sm" className="text-xs">
                              <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                              Užitočné
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">Telefón</p>
                          <p className="text-muted-foreground">
                            {craftsman.contact.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">
                            {craftsman.contact.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">Dostupnosť</p>
                          <p className="text-muted-foreground">
                            {craftsman.contact.available}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">Región pôsobenia</p>
                          <p className="text-muted-foreground">
                            Bratislavský kraj, Trnavský kraj
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
