
import React from "react";
import { Shield, Heart, Eye, Sparkles } from "lucide-react";

export const TrustIndicators = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slide-up" style={{animationDelay: "300ms"}}>
      <div className="flex flex-col items-center p-6 glass rounded-xl hover-lift">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-4 shadow-soft">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <div className="text-2xl font-bold font-heading text-primary mb-1">100%</div>
        <div className="text-muted-foreground font-medium text-center">Úplne zadarmo</div>
      </div>
      
      <div className="flex flex-col items-center p-6 glass rounded-xl hover-lift">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-soft">
          <Eye className="h-8 w-8 text-white" />
        </div>
        <div className="text-2xl font-bold font-heading text-primary mb-1">100%</div>
        <div className="text-muted-foreground font-medium text-center">Transparentné</div>
      </div>
      
      <div className="flex flex-col items-center p-6 glass rounded-xl hover-lift">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-4 shadow-soft">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="text-2xl font-bold font-heading text-primary mb-1">Nová</div>
        <div className="text-muted-foreground font-medium text-center">Vízia pre budúcnosť</div>
      </div>
    </div>
  );
};
