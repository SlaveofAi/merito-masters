
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Shield, Heart, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const handleSearch = () => {
    navigate('/home', { state: { searchTerm } });
  };
  
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-secondary/30">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent)] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in">
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-sm">
            <Shield className="h-3 w-3 mr-1" />
            100% Bezplatné
          </Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-sm">
            <Heart className="h-3 w-3 mr-1" />
            Overené profily
          </Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-sm">
            <Zap className="h-3 w-3 mr-1" />
            Jednoducho
          </Badge>
        </div>
        
        <div className="inline-block mb-3 px-3 py-1 bg-black/5 backdrop-blur-sm text-sm font-medium rounded-full animate-fade-in hover:bg-black/10 transition-all duration-300 cursor-default">
          Profesionálni remeselníci na jednom mieste
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up group">
          Nájdite najlepších <br className="hidden sm:block" /> 
          <span className="relative inline-block group-hover:scale-105 transition-transform duration-500">
            remeselníkov
            <span className="absolute bottom-1 left-0 w-full h-[2px] bg-primary/30 group-hover:bg-primary/50 transition-colors duration-300"></span>
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up hover:text-foreground/80 transition-colors duration-300" style={{animationDelay: "100ms"}}>
          Platforma, ktorá spája profesionálnych remeselníkov a ľudí, 
          ktorí potrebujú kvalitné služby remeselníkov priamo na Slovensku.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{animationDelay: "200ms"}}>
          <div className="relative w-full max-w-md group">
            <Search className={`absolute left-3 top-2.5 h-5 w-5 transition-all duration-300 ${
              isSearchFocused ? 'text-primary scale-110' : 'text-muted-foreground'
            }`} />
            <input
              type="text"
              placeholder="Hľadajte podľa profesie alebo lokality..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-md border bg-white/50 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white focus:shadow-md hover:shadow-md hover:bg-white/70 ${
                isSearchFocused ? 'scale-102' : ''
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className={`absolute inset-0 rounded-md bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none ${
              isSearchFocused ? 'opacity-100' : ''
            }`}></div>
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-auto group relative overflow-hidden hover:shadow-lg active:scale-[0.98] transition-all duration-300" 
            onClick={handleSearch}
          >
            <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300">
              Vyhľadať
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex items-center group cursor-default hover:text-foreground transition-colors duration-300">
            <div className="w-2 h-2 rounded-full bg-primary mr-2 group-hover:scale-125 group-hover:bg-primary/80 transition-all duration-300"></div>
            <span>500+ Remeselníkov</span>
          </div>
          <div className="flex items-center group cursor-default hover:text-foreground transition-colors duration-300">
            <div className="w-2 h-2 rounded-full bg-primary mr-2 group-hover:scale-125 group-hover:bg-primary/80 transition-all duration-300"></div>
            <span>100+ Miest</span>
          </div>
          <div className="flex items-center group cursor-default hover:text-foreground transition-colors duration-300">
            <div className="w-2 h-2 rounded-full bg-primary mr-2 group-hover:scale-125 group-hover:bg-primary/80 transition-all duration-300"></div>
            <span>20+ Kategórií</span>
          </div>
        </div>

        {/* Additional trust indicators */}
        <div className="mt-12 text-xs text-muted-foreground/80 animate-fade-in" style={{animationDelay: "400ms"}}>
          <p className="hover:text-muted-foreground transition-colors duration-300 cursor-default">
            ✓ Žiadne skryté poplatky • ✓ Rýchla registrácia • ✓ Spoľahlivé hodnotenia
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Hero;
