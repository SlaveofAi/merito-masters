import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, MapPin, Filter, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CraftsmanCard from "@/components/CraftsmanCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllCategories } from "@/constants/categories";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Check if we have a search term or category from another component
  const initialSearchTerm = location.state?.searchTerm || "";
  const initialCategoryFilter = location.state?.categoryFilter || "Všetky kategórie";
  const initialLocationFilter = location.state?.userLocation || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [locationFilter, setLocationFilter] = useState(initialLocationFilter);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);

  // Update search term and category when location state changes
  useEffect(() => {
    if (location.state) {
      if (location.state.searchTerm) {
        setSearchTerm(location.state.searchTerm);
      }
      if (location.state.categoryFilter) {
        setCategoryFilter(location.state.categoryFilter);
      }
      if (location.state.userLocation) {
        setLocationFilter(location.state.userLocation);
      }
      
      // Clear the location state to avoid persisting after navigation
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Save user location to localStorage
  useEffect(() => {
    if (locationFilter) {
      localStorage.setItem("userLocation", locationFilter);
    }
  }, [locationFilter]);

  // Fetch craftsmen data from Supabase
  const { data: craftsmen, isLoading, error } = useQuery({
    queryKey: ['craftsmen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('craftsman_profiles')
        .select('*');
      
      if (error) {
        console.error("Error fetching craftsmen:", error);
        throw new Error(error.message);
      }
      
      return data || [];
    }
  });

  // Filter craftsmen based on search term, location, and category
  const filteredCraftsmen = craftsmen?.filter(craftsman => {
    const matchesSearch = 
      craftsman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      craftsman.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      craftsman.trade_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      craftsman.custom_specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = 
      !locationFilter || 
      craftsman.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "Všetky kategórie" || 
      craftsman.trade_category === categoryFilter ||
      craftsman.custom_specialization === categoryFilter;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Sort craftsmen by topped status and proximity to user location if available
  const sortedCraftsmen = [...(filteredCraftsmen || [])].sort((a, b) => {
    const currentDate = new Date();
    
    // First check topped status - topped craftsmen always come first
    const aIsTopped = a.is_topped && new Date(a.topped_until) > currentDate;
    const bIsTopped = b.is_topped && new Date(b.topped_until) > currentDate;
    
    if (aIsTopped && !bIsTopped) return -1;
    if (!aIsTopped && bIsTopped) return 1;
    
    // Then check location if filter is set
    if (locationFilter) {
      const aMatchesExact = a.location.toLowerCase() === locationFilter.toLowerCase();
      const bMatchesExact = b.location.toLowerCase() === locationFilter.toLowerCase();
      
      if (aMatchesExact && !bMatchesExact) return -1;
      if (!aMatchesExact && bMatchesExact) return 1;
      
      const aContains = a.location.toLowerCase().includes(locationFilter.toLowerCase());
      const bContains = b.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
    }
    
    return 0;
  });

  // Placeholder images for craftsmen without profile images
  const getPlaceholderImage = (tradeCategory: string) => {
    const categories: Record<string, string> = {
      "Stolár": "https://images.unsplash.com/photo-1565372195458-9de0b320ef04",
      "Elektrikár": "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
      "Murár": "https://images.unsplash.com/photo-1604709266125-3e332a6caaf9",
      "Inštalatér": "https://images.unsplash.com/photo-1606924572760-f180e47dcc11",
      "default": "https://images.unsplash.com/photo-1529220502050-f15e570c634b"
    };
    
    return categories[tradeCategory] || categories.default;
  };

  return (
    <Layout>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 section-padding">
        {/* Enhanced header section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-gradient mb-6">
            Nájdite najlepších remeselníkov
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prechádzajte cez overených profesionálov vo vašej oblasti a nájdite toho pravého pre váš projekt.
          </p>
        </div>
        
        {/* Enhanced search and filter section */}
        <div className="glass p-6 rounded-2xl mb-12 border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Hľadajte podľa mena alebo remesla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-border/50 focus:border-primary/50 rounded-xl bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="md:col-span-3 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Zadajte lokalitu..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-12 h-12 border-border/50 focus:border-primary/50 rounded-xl bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="md:col-span-3">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="h-12 border-border/50 focus:border-primary/50 rounded-xl bg-white/50 backdrop-blur-sm">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Filter podľa kategórie" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  {getAllCategories().map((category) => (
                    <SelectItem key={category} value={category} className="rounded-lg">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              className="md:col-span-1 h-12 btn-secondary rounded-xl"
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("");
                setCategoryFilter("Všetky kategórie");
              }}
              variant="outline"
            >
              Reset
            </Button>
          </div>
          
          {/* Enhanced link to categories */}
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/categories')}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Zobraziť všetky kategórie →
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-medium">Načítavame remeselníkov...</p>
          </div>
        ) : error ? (
          <Card className="card-enhanced">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2">Nastala chyba</h3>
              <p className="text-center text-muted-foreground mb-6">
                Nastala chyba pri načítaní remeselníkov. Skúste to prosím neskôr.
              </p>
              <Button onClick={() => window.location.reload()} className="btn-primary">
                Skúsiť znova
              </Button>
            </CardContent>
          </Card>
        ) : sortedCraftsmen?.length === 0 ? (
          <Card className="card-enhanced">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2">Žiadne výsledky</h3>
              <p className="text-center text-muted-foreground mb-6">
                Nenašli sa žiadni remeselníci podľa vašich kritérií. Skúste upraviť vyhľadávanie.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("");
                  setCategoryFilter("Všetky kategórie");
                }}
                className="btn-primary"
              >
                Zobraziť všetkých remeselníkov
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Enhanced results info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                <span className="text-muted-foreground font-medium">
                  Nájdených {sortedCraftsmen?.length} remeselníkov
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span>Premium profily sú zobrazené na vrchu</span>
              </div>
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedCraftsmen?.map((craftsman) => {
                const isTopped = craftsman.is_topped && new Date(craftsman.topped_until) > new Date();
                return (
                  <CraftsmanCard
                    key={craftsman.id}
                    id={craftsman.id}
                    name={craftsman.name}
                    profession={craftsman.custom_specialization || craftsman.trade_category}
                    location={craftsman.location}
                    imageUrl={craftsman.profile_image_url || getPlaceholderImage(craftsman.trade_category)}
                    customSpecialization={craftsman.custom_specialization}
                    isTopped={isTopped}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
