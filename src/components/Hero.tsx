
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Shield, Users, Award } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = () => {
    navigate('/home', { state: { searchTerm } });
  };
  
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.15)_1px,_transparent_0)] bg-[size:20px_20px]"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main heading section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-gray-900">
            Nájdite najlepších <br className="hidden sm:block" /> 
            <span className="text-blue-600">remeselníkov</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
            Spojíme vás s overenými profesionálmi na Slovensku
          </p>
        </div>
        
        {/* Search section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 max-w-2xl mx-auto">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Hľadajte podľa profesie alebo lokality..."
              className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-blue-500 transition-all hover:border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
            onClick={handleSearch}
          >
            Vyhľadať
          </Button>
        </div>
        
        {/* Trust indicators - minimalistic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
            <div className="text-gray-600 font-medium">Overených remeselníkov</div>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">100+</div>
            <div className="text-gray-600 font-medium">Miest na Slovensku</div>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Award className="h-7 w-7 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">20+</div>
            <div className="text-gray-600 font-medium">Rôznych kategórií</div>
          </div>
        </div>
        
        {/* Simple call to action */}
        <div className="text-sm text-gray-500">
          <p>Transparentne • Zadarmo • Spoľahlivo</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
