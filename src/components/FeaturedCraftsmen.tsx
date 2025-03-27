
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CraftsmanCard from "./CraftsmanCard";

// Sample data for featured craftsmen
const featuredCraftsmen = [
  {
    id: "1",
    name: "Martin Kováč",
    profession: "Stolár",
    location: "Bratislava",
    rating: 4.8,
    reviewCount: 24,
    imageUrl: "https://images.unsplash.com/photo-1466096115517-bceecbfb6fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "2",
    name: "Jozef Novák",
    profession: "Elektrikár",
    location: "Košice",
    rating: 4.6,
    reviewCount: 18,
    imageUrl: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "3",
    name: "Peter Horváth",
    profession: "Maliar",
    location: "Žilina",
    rating: 4.9,
    reviewCount: 32,
    imageUrl: "https://images.unsplash.com/photo-1613293967931-33854b1177a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
];

const FeaturedCraftsmen = () => {
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
        {featuredCraftsmen.map((craftsman) => (
          <CraftsmanCard
            key={craftsman.id}
            id={craftsman.id}
            name={craftsman.name}
            profession={craftsman.profession}
            location={craftsman.location}
            rating={craftsman.rating}
            reviewCount={craftsman.reviewCount}
            imageUrl={craftsman.imageUrl}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCraftsmen;
