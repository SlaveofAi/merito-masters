
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, MapPin, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CraftsmanCard from "@/components/CraftsmanCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Craft categories for filtering
const craftCategories = [
  'Všetky kategórie',
  'Stolár',
  'Elektrikár',
  'Murár',
  'Inštalatér',
  'Maliar',
  'Podlahár',
  'Klampiar',
  'Zámočník',
  'Tesár',
  'Záhradník',
  'Kúrenár',
  'Sklenár'
];

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Všetky kategórie");

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
      craftsman.trade_category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = 
      !locationFilter || 
      craftsman.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "Všetky kategórie" || 
      craftsman.trade_category === categoryFilter;
    
    return matchesSearch && matchesLocation && matchesCategory;
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Nájdite najlepších remeselníkov</h2>
          
          {/* Search and filter section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Hľadajte podľa mena alebo remesla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="md:col-span-3 relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Zadajte lokalitu..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="md:col-span-3">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter podľa kategórie" />
                </SelectTrigger>
                <SelectContent>
                  {craftCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              className="md:col-span-1"
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
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground mb-4">
                Nastala chyba pri načítaní remeselníkov. Skúste to prosím neskôr.
              </p>
              <Button onClick={() => window.location.reload()}>
                Skúsiť znova
              </Button>
            </CardContent>
          </Card>
        ) : filteredCraftsmen?.length === 0 ? (
          <Card>
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
              >
                Zobraziť všetkých remeselníkov
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCraftsmen?.map((craftsman) => (
              <CraftsmanCard
                key={craftsman.id}
                id={craftsman.id}
                name={craftsman.name}
                profession={craftsman.trade_category}
                location={craftsman.location}
                rating={4.5} // Placeholder rating until reviews system is implemented
                reviewCount={12} // Placeholder review count
                imageUrl={craftsman.profile_image_url || getPlaceholderImage(craftsman.trade_category)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
