
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CraftsmanCard from "./CraftsmanCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FeaturedCraftsmen = () => {
  const navigate = useNavigate();

  // Fetch featured craftsmen from database
  const { data: featuredCraftsmen, isLoading } = useQuery({
    queryKey: ['featured-craftsmen'],
    queryFn: async () => {
      const currentDate = new Date().toISOString();
      
      console.log("Fetching featured craftsmen at:", currentDate);
      
      // First check for actively topped craftsmen (not expired)
      const { data: toppedCraftsmen, error: toppedError } = await supabase
        .from('craftsman_profiles')
        .select('*')
        .eq('is_topped', true)
        .gte('topped_until', currentDate)
        .order('topped_until', { ascending: true })
        .limit(3);
        
      if (toppedError) {
        console.error("Error fetching topped craftsmen:", toppedError);
      }
      
      console.log("Found active topped craftsmen:", toppedCraftsmen?.length || 0);
      
      // If we don't have enough topped craftsmen, fetch regular ones to fill the slots
      const neededRegularCraftsmen = 3 - (toppedCraftsmen?.length || 0);
      
      if (neededRegularCraftsmen > 0) {
        const { data: regularCraftsmen, error: regularError } = await supabase
          .from('craftsman_profiles')
          .select('*')
          .or(`is_topped.eq.false,topped_until.lt.${currentDate}`)
          .limit(neededRegularCraftsmen);
          
        if (regularError) {
          console.error("Error fetching regular craftsmen:", regularError);
          return toppedCraftsmen || [];
        }
        
        console.log("Found regular craftsmen:", regularCraftsmen?.length || 0);
        
        // Combine the topped and regular craftsmen
        return [...(toppedCraftsmen || []), ...(regularCraftsmen || [])];
      }
      
      return toppedCraftsmen || [];
    }
  });

  const handleShowAllCraftsmen = () => {
    // Navigate to homepage and trigger search section to show all craftsmen
    navigate('/', { 
      state: { 
        searchTerm: '', 
        categoryFilter: 'Všetky kategórie',
        scrollToResults: true 
      } 
    });
  };

  // Only use placeholder data if we have no real data AND we're not loading
  const shouldUsePlaceholder = !isLoading && (!featuredCraftsmen || featuredCraftsmen.length === 0);
  
  // Use placeholder data only when necessary and with proper UUID format
  const placeholderCraftsmen = shouldUsePlaceholder ? [
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Martin Kováč",
      trade_category: "Stolár",
      location: "Bratislava",
      profile_image_url: "https://images.unsplash.com/photo-1466096115517-bceecbfb6fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      custom_specialization: null,
      is_topped: false,
      topped_until: null,
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Jozef Novák",
      trade_category: "Elektrikár",
      location: "Košice",
      profile_image_url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      custom_specialization: null,
      is_topped: false,
      topped_until: null,
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Peter Horváth",
      trade_category: "Maliar",
      location: "Žilina",
      profile_image_url: "https://images.unsplash.com/photo-1613293967931-33854b1177a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      custom_specialization: null,
      is_topped: false,
      topped_until: null,
    },
  ] : [];

  const displayCraftsmen = featuredCraftsmen && featuredCraftsmen.length > 0
    ? featuredCraftsmen.map(craftsman => {
        // Check if topped status is actually active
        const isActivelyTopped = craftsman.is_topped && 
          craftsman.topped_until && 
          new Date() < new Date(craftsman.topped_until);
          
        return {
          id: craftsman.id,
          name: craftsman.name,
          profession: craftsman.trade_category,
          location: craftsman.location,
          imageUrl: craftsman.profile_image_url || getPlaceholderImage(craftsman.trade_category),
          customSpecialization: craftsman.custom_specialization,
          isTopped: isActivelyTopped,
          toppedUntil: craftsman.topped_until,
        };
      })
    : placeholderCraftsmen.map(craftsman => ({
        id: craftsman.id,
        name: craftsman.name,
        profession: craftsman.trade_category,
        location: craftsman.location,
        imageUrl: craftsman.profile_image_url,
        customSpecialization: craftsman.custom_specialization,
        isTopped: false,
        toppedUntil: null,
      }));

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
    <section className="section-padding bg-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent)] pointer-events-none"></div>
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">
            Objavte najlepších remeselníkov
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Vyberáme pre vás tých najlepších odborníkov a remeselníkov zo Slovenska s overenými recenziami od reálnych zákazníkov.
          </p>
        </div>
        <Button variant="ghost" className="flex items-center" onClick={handleShowAllCraftsmen}>
          <span>Zobraziť všetkých</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayCraftsmen.map((craftsman) => (
          <CraftsmanCard
            key={craftsman.id}
            id={craftsman.id}
            name={craftsman.name}
            profession={craftsman.profession}
            location={craftsman.location}
            imageUrl={craftsman.imageUrl}
            customSpecialization={craftsman.customSpecialization}
            isTopped={craftsman.isTopped}
            toppedUntil={craftsman.toppedUntil}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCraftsmen;
