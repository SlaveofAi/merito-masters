
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const handleSearch = () => {
    // Navigate to the main page with search state instead of /home
    navigate('/', { state: { searchTerm, scrollToResults: true } });
  };
  
  return (
    <div className="relative bg-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Nájdite svojho remeselníka
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="relative w-full group">
            <Search className={`absolute left-3 top-2.5 h-5 w-5 transition-all duration-300 ${
              isSearchFocused ? 'text-primary scale-110' : 'text-muted-foreground'
            }`} />
            <input
              type="text"
              placeholder="Hľadajte podľa profesie alebo mena..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-md border bg-white shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:shadow-md hover:shadow-md ${
                isSearchFocused ? 'scale-102' : ''
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-auto group relative overflow-hidden hover:shadow-lg active:scale-[0.98] transition-all duration-300" 
            onClick={handleSearch}
          >
            <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300">
              Vyhľadať
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
