
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedCraftsmen from "@/components/FeaturedCraftsmen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, MapPin, Filter, TrendingUp, Check, Shield, Clock, Star } from "lucide-react";
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
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Check if we have a search term or category from another component
  const initialSearchTerm = location.state?.searchTerm || "";
  const initialCategoryFilter = location.state?.categoryFilter || "Všetky kategórie";
  const initialLocationFilter = location.state?.userLocation || "";
  const shouldScrollToResults = location.state?.scrollToResults || false;
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [locationFilter, setLocationFilter] = useState(initialLocationFilter);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [showSearchSection, setShowSearchSection] = useState(false);

  // Update search term and category when location state changes
  useEffect(() => {
    if (location.state) {
      if (location.state.searchTerm) {
        setSearchTerm(location.state.searchTerm);
        setShowSearchSection(true);
      }
      if (location.state.categoryFilter) {
        setCategoryFilter(location.state.categoryFilter);
      }
      if (location.state.userLocation) {
        setLocationFilter(location.state.userLocation);
      }
      if (location.state.scrollToResults) {
        setShowSearchSection(true);
        // Scroll to results section after a brief delay
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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

  // Show search section when user starts searching
  useEffect(() => {
    if (searchTerm || locationFilter || categoryFilter !== "Všetky kategórie") {
      setShowSearchSection(true);
    }
  }, [searchTerm, locationFilter, categoryFilter]);

  // Fetch craftsmen data from Supabase
  const { data: craftsmen, isLoading, error } = useQuery({
    queryKey: ['craftsmen'],
    queryFn: async () => {
      console.log("Fetching craftsmen from database");
      const { data, error } = await supabase
        .from('craftsman_profiles')
        .select('*');
      
      if (error) {
        console.error("Error fetching craftsmen:", error);
        throw new Error(error.message);
      }
      
      console.log("Fetched craftsmen:", data?.length || 0);
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

  const features = [
    {
      icon: <Check className="h-5 w-5" />,
      title: "100% zadarmo",
      description: "Bez skrytých poplatkov"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Transparentné",
      description: "Overené recenzie a hodnotenia"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Jednoduché použitie",
      description: "Nájdite remeselníka za pár kliknutí"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Kvalitní majstri",
      description: "Len overení odborníci"
    }
  ];

  const categories = [
    "Elektrikár", "Stolár", "Maliar", "Inštalatér", 
    "Murár", "Kľučkár", "Záhradník", "Čistenie"
  ];

  const stats = [
    { number: "500+", label: "Remeselníkov" },
    { number: "1000+", label: "Spokojných zákazníkov" },
    { number: "50+", label: "Miest na Slovensku" },
    { number: "4.8", label: "Priemerné hodnotenie" }
  ];

  return (
    <Layout>
      <Hero />
      
      {/* Feature badges section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedCraftsmen />

      {/* Categories section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Populárne kategórie
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vyberte si z najžiadanejších remesiel a služieb
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 text-base hover:bg-primary hover:text-white transition-colors"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Dôveruje nám tisícky zákazníkov
            </h2>
            <p className="text-xl opacity-90">
              Spojujeme kvalitných remeselníkov so spokojenými zákazníkmi
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ako to funguje?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jednoduchý proces v troch krokoch
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Opíšte prácu</h3>
              <p className="text-gray-600">
                Zadajte detaily o práci, ktorú potrebujete urobiť
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Dostanete ponuky</h3>
              <p className="text-gray-600">
                Kvalifikovaní remeselníci vám pošlú svoje cenové ponuky
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Vyberte najlepšieho</h3>
              <p className="text-gray-600">
                Porovnajte ponuky a vyberte si toho najvhodnejšieho majstra
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Začnite ešte dnes
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Pripojte sa k tisíckam spokojných zákazníkov a nájdite svojho ideálneho remeselníka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Zverejniť požiadavku
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Prehliadať remeselníkov
            </Button>
          </div>
        </div>
      </section>
      
      {/* Search and Results Section - Only shown when user interacts with search */}
      {showSearchSection && (
        <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 hover:text-primary/80 transition-colors duration-300 cursor-default">
              Výsledky vyhľadávania
            </h2>
            
            {/* Search and filter section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 relative group">
                <Search className={`absolute left-3 top-3 h-5 w-5 transition-all duration-300 z-10 ${
                  isSearchFocused ? 'text-primary scale-110' : 'text-muted-foreground'
                }`} />
                <Input
                  placeholder="Hľadajte podľa mena alebo remesla..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`pl-10 transition-all duration-300 hover:shadow-md focus:shadow-lg focus:scale-[1.02] ${
                    isSearchFocused ? 'border-primary/30' : ''
                  }`}
                />
              </div>
              
              <div className="md:col-span-3 relative group">
                <MapPin className={`absolute left-3 top-3 h-5 w-5 transition-all duration-300 z-10 ${
                  isLocationFocused ? 'text-primary scale-110' : 'text-muted-foreground'
                }`} />
                <Input
                  placeholder="Zadajte lokalitu..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  onFocus={() => setIsLocationFocused(true)}
                  onBlur={() => setIsLocationFocused(false)}
                  className={`pl-10 transition-all duration-300 hover:shadow-md focus:shadow-lg focus:scale-[1.02] ${
                    isLocationFocused ? 'border-primary/30' : ''
                  }`}
                />
              </div>
              
              <div className="md:col-span-3">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="transition-all duration-300 hover:shadow-md focus:shadow-lg focus:scale-[1.02] hover:border-primary/30">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter podľa kategórie" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllCategories().map((category) => (
                      <SelectItem key={category} value={category} className="hover:bg-primary/5 transition-colors duration-200">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                className="md:col-span-1 group relative overflow-hidden hover:shadow-lg active:scale-[0.98] transition-all duration-300"
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("");
                  setCategoryFilter("Všetky kategórie");
                }}
                variant="outline"
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">Reset</span>
              </Button>
            </div>
            
            {/* Link to categories page */}
            <div className="mt-4 text-right">
              <Button 
                variant="link" 
                onClick={() => navigate('/categories')}
                className="text-primary hover:text-primary/80 hover:translate-x-1 transition-all duration-300"
              >
                Zobraziť všetky kategórie
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground mb-4">
                  Nastala chyba pri načítaní remeselníkov. Skúste to prosím neskôr.
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="hover:shadow-md active:scale-[0.98] transition-all duration-300"
                >
                  Skúsiť znova
                </Button>
              </CardContent>
            </Card>
          ) : sortedCraftsmen?.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground mb-4">
                  Nenašli sa žiadni remeselníci podľa vašich kritérií. Skúste upraviť vyhľadávanie.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("");
                    setCategoryFilter("Všetky kategórie");
                  }}
                  className="hover:shadow-md active:scale-[0.98] transition-all duration-300"
                >
                  Zobraziť všetkých remeselníkov
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Legend for topped craftsmen */}
              <div className="flex items-center gap-2 mb-4 text-sm group">
                <TrendingUp className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Zvýraznené profily sú zobrazené na vrchu</span>
              </div>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCraftsmen?.map((craftsman, index) => {
                  const isTopped = craftsman.is_topped && new Date(craftsman.topped_until) > new Date();
                  return (
                    <div 
                      key={craftsman.id}
                      className="animate-fade-in hover:scale-[1.02] transition-all duration-300"
                      style={{animationDelay: `${index * 100}ms`}}
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
      )}
    </Layout>
  );
};

export default Index;
