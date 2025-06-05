
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Shield, Users, Award } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = () => {
    navigate('/home', { state: { searchTerm } });
  };
  
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{animationDelay: "1s"}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/60 backdrop-blur-sm text-sm font-medium rounded-full border border-primary/20 animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-gradient">Profesionálni remeselníci na jednom mieste</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-8 animate-slide-up">
          Nájdite najlepších <br className="hidden sm:block" /> 
          <span className="relative inline-block text-gradient">
            remeselníkov
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full"></div>
          </span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed animate-slide-up" style={{animationDelay: "100ms"}}>
          Platforma, ktorá spája profesionálnych remeselníkov a ľudí, 
          ktorí potrebujú kvalitné služby remeselníkov priamo na Slovensku.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{animationDelay: "200ms"}}>
          <div className="relative w-full max-w-lg group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Hľadajte podľa profesie alebo lokality..."
              className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:border-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-auto btn-primary text-lg px-8 py-4 rounded-xl"
            onClick={handleSearch}
          >
            Vyhľadať
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex flex-col items-center p-6 glass rounded-xl hover-lift">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-soft">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="text-2xl font-bold font-heading text-primary mb-1">500+</div>
            <div className="text-muted-foreground font-medium">Overených remeselníkov</div>
          </div>
          
          <div className="flex flex-col items-center p-6 glass rounded-xl hover-lift">
            <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center mb-4 shadow-soft">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="text-2xl font-bold font-heading text-primary mb-1">100+</div>
            <div className="text-muted-foreground font-medium">Miest na Slovensku</div>
          </div>
          
          <div className="flex flex-col items-center p-6 glass rounded-xl hover-lift">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-700 rounded-xl flex items-center justify-center mb-4 shadow-soft">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div className="text-2xl font-bold font-heading text-primary mb-1">20+</div>
            <div className="text-muted-foreground font-medium">Rôznych kategórií</div>
          </div>
        </div>
        
        {/* Social proof */}
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-slide-up" style={{animationDelay: "400ms"}}>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-accent-100 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-success-100 border-2 border-white"></div>
            </div>
            <span className="font-medium">Dôveruje nám už tisíce zákazníkov</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Hero;
