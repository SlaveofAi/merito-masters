
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-secondary/30">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent)] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block mb-3 px-3 py-1 bg-black/5 backdrop-blur-sm text-sm font-medium rounded-full animate-fade-in">
          Profesionálni remeselníci na jednom mieste
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
          Nájdite najlepších <br className="hidden sm:block" /> 
          <span className="relative inline-block">
            remeselníkov
            <span className="absolute bottom-1 left-0 w-full h-[2px] bg-primary/30"></span>
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up" style={{animationDelay: "100ms"}}>
          Platforma, ktorá spája profesionálnych remeselníkov a ľudí, 
          ktorí potrebujú kvalitné služby remeselníkov priamo na Slovensku.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{animationDelay: "200ms"}}>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Hľadajte podľa profesie alebo lokality..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button size="lg" className="w-full sm:w-auto">
            Vyhľadať
          </Button>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
            <span>500+ Remeselníkov</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
            <span>100+ Miest</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
            <span>20+ Kategórií</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Hero;
