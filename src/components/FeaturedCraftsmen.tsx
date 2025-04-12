
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CraftsmanCard from "./CraftsmanCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FeaturedCraftsmen = () => {
  // Fetch featured craftsmen from database
  const { data: featuredCraftsmen, isLoading } = useQuery({
    queryKey: ['featured-craftsmen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('craftsman_profiles')
        .select('*')
        .limit(3);
        
      if (error) {
        console.error("Error fetching craftsmen:", error);
        return [];
      }
      
      return data;
    }
  });

  // Use placeholder data if loading or no data available
  const placeholderCraftsmen = [
    {
      id: "1",
      name: "Martin Kováč",
      profession: "Stolár",
      location: "Bratislava",
      imageUrl: "https://images.unsplash.com/photo-1466096115517-bceecbfb6fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "2",
      name: "Jozef Novák",
      profession: "Elektrikár",
      location: "Košice",
      imageUrl: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "3",
      name: "Peter Horváth",
      profession: "Maliar",
      location: "Žilina",
      imageUrl: "https://images.unsplash.com/photo-1613293967931-33854b1177a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    },
  ];

  const displayCraftsmen = isLoading || !featuredCraftsmen || featuredCraftsmen.length === 0 
    ? placeholderCraftsmen 
    : featuredCraftsmen.map(craftsman => ({
        id: craftsman.id,
        name: craftsman.name,
        profession: craftsman.trade_category,
        location: craftsman.location,
        imageUrl: craftsman.profile_image_url || getPlaceholderImage(craftsman.trade_category),
        customSpecialization: craftsman.custom_specialization,
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
        <Link to="/craftsmen">
          <Button variant="ghost" className="flex items-center">
            <span>Zobraziť všetkých</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
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
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCraftsmen;
