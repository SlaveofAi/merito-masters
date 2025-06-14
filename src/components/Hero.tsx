
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
    navigate('/', { state: { searchTerm } });
  };

  const handleRemeselnikovClick = () => {
    // Focus on the search input when "remeselníkov" is clicked
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };
  
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-secondary/30">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent)] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 animate-fade-in">
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-sm text-xs sm:text-sm px-2 py-1">
            <Shield className="h-3 w-3 mr-1" />
            100% Bezplatné
          </Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-sm text-xs sm:text-sm px-2 py-1">
            <Heart className="h-3 w-3 mr-1" />
            Overené profily
          </Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-sm text-xs sm:text-sm px-2 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Jednoducho
          </Badge>
        </div>
        
        <div className="inline-block mb-2 sm:mb-3 px-3 py-1 bg-black/5 backdrop-blur-sm text-xs sm:text-sm font-medium rounded-full animate-fade-in hover:bg-black/10 transition-all duration-300 cursor-default">
          Profesionálni remeselníci na jednom mieste
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 animate-slide-up group leading-tight">
          Nájdite najlepších <br className="hidden sm:block" /> 
          <span className="relative inline-block group-hover:scale-105 transition-transform duration-500">
            <span 
              className="cursor-pointer hover:text-primary transition-colors duration-300"
              onClick={handleRemeselnikovClick}
            >
              remeselníkov
            </span>
            <span className="absolute bottom-1 left-0 w-full h-[2px] bg-primary/30 group-hover:bg-primary/50 transition-colors duration-300"></span>
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 animate-slide-up hover:text-foreground/80 transition-colors duration-300 leading-relaxed px-2" style={{animationDelay: "100ms"}}>
          Platforma, ktorá spája profesionálnych remeselníkov a ľudí, 
          ktorí potrebujú kvalitné služby remeselníkov priamo na Slovensku.
        </p>
        
        <div className="flex flex-col gap-3 sm:gap-4 animate-slide-up max-w-lg mx-auto" style={{animationDelay: "200ms"}}>
          <div className="relative w-full group">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 z-10 ${
              isSearchFocused ? 'text-primary scale-110' : 'text-muted-foreground'
            }`} />
            <input
              type="text"
              placeholder="Hľadajte podľa profesie alebo lokality..."
              className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-md border bg-white/50 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white focus:shadow-md hover:shadow-md hover:bg-white/70 min-h-[44px] ${
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
            className="w-full group relative overflow-hidden hover:shadow-lg active:scale-[0.98] transition-all duration-300 min-h-[44px] text-sm sm:text-base py-3 sm:py-3.5" 
            onClick={handleSearch}
          >
            <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300">
              Vyhľadať
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>

        {/* Additional trust indicators */}
        <div className="mt-8 sm:mt-12 text-xs text-muted-foreground/80 animate-fade-in px-4" style={{animationDelay: "300ms"}}>
          <p className="hover:text-muted-foreground transition-colors duration-300 cursor-default leading-relaxed">
            ✓ Žiadne skryté poplatky • ✓ Rýchla registrácia • ✓ Spoľahlivé hodnotenia
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32 sm:h-64 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Hero;
