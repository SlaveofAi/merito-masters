
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Star, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const ToppedCraftsmanFeature = () => {
  const { createToppedPayment, loading } = useSubscription();

  const handleUpgrade = () => {
    createToppedPayment();
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-800">Zvýšte svoju viditeľnosť</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700 mb-4">
          Získajte viac zákazníkov s top pozíciou. Váš profil sa zobrazí na prvých miestach po dobu 1 týždňa.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Star className="h-4 w-4" />
            <span>Top pozícia 7 dní</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <TrendingUp className="h-4 w-4" />
            <span>Viac zákazníkov</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Crown className="h-4 w-4" />
            <span>Len €9.99</span>
          </div>
        </div>

        <Button onClick={handleUpgrade} className="w-full" disabled={loading}>
          <Crown className="h-4 w-4 mr-2" />
          {loading ? "Spracováva sa..." : "Aktivovať za €9.99"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ToppedCraftsmanFeature;
