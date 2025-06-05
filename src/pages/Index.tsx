
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, MapPin, Filter, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CraftsmanCard from "@/components/CraftsmanCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllCategories } from "@/constants/categories";
import { CraftsmanCardSkeleton } from "@/components/ui/loading-skeleton";
import { TrustIndicators } from "@/components/TrustIndicators";
import { SocialProof } from "@/components/SocialProof";

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
      
      {/* Trust indicators section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <TrustIndicators />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Clean header section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nájdite overených remeselníkov
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prezrite si profily profesionálov vo vašej oblasti
          </p>
        </div>
        
        {/* Minimalistic search and filter section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Hľadajte podľa mena alebo remesla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-blue-500 rounded-xl bg-white"
              />
            </div>
            
            <div className="md:col-span-3 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Lokalita..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-blue-500 rounded-xl bg-white"
              />
            </div>
            
            <div className="md:col-span-3">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 rounded-xl bg-white">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Kategória" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 bg-white">
                  {getAllCategories().map((category) => (
                    <SelectItem key={category} value={category} className="rounded-lg">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              className="md:col-span-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border-0"
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
          
          {/* Link to categories */}
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/categories')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Zobraziť všetky kategórie →
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Načítavame remeselníkov...</p>
            </div>
            <CraftsmanCardSkeleton count={6} />
          </div>
        ) : error ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nastala chyba</h3>
              <p className="text-center text-gray-600 mb-6">
                Nastala chyba pri načítaní remeselníkov. Skúste to prosím neskôr.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Skúsiť znova
              </Button>
            </CardContent>
          </Card>
        ) : sortedCraftsmen?.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Žiadne výsledky</h3>
              <p className="text-center text-gray-600 mb-6">
                Nenašli sa žiadni remeselníci podľa vašich kritérií.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("");
                  setCategoryFilter("Všetky kategórie");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Zobraziť všetkých remeselníkov
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Clean results info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">
                  Nájdených {sortedCraftsmen?.length} remeselníkov
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span>Premium profily na vrchu</span>
              </div>
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCraftsmen?.map((craftsman, index) => {
                const isTopped = craftsman.is_topped && new Date(craftsman.topped_until) > new Date();
                return (
                  <div 
                    key={craftsman.id}
                    className="opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <CraftsmanCard
                      id={craftsman.id}
                      name={craftsman.name}
                      profession={craftsman.custom_specialization || craftsman.trade_category}
                      location={craftsman.location}
                      imageUrl={craftsman.profile_image_url || getPlaceholderImage(craftsman.trade_category)}
                      customSpecialization={craftsman.custom_specialization}
                      isTopped={isTopped}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {/* Social proof section */}
      <SocialProof />
    </Layout>
  );
};

export default Index;
