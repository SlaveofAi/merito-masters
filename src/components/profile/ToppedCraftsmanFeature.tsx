
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const ToppedCraftsmanFeature = () => {
  const { subscriptionData, createCheckout } = useSubscription();

  const handleUpgrade = () => {
    createCheckout("premium");
  };

  if (subscriptionData.subscribed) {
    return (
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800">Premium účet</CardTitle>
            <Badge className="bg-yellow-500 text-white">AKTÍVNE</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 mb-4">
            Váš premium účet vám poskytuje všetky výhody pre úspešné podnikanie.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <Star className="h-4 w-4" />
              <span>Prioritné zobrazenie</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <TrendingUp className="h-4 w-4" />
              <span>Viac zákazníkov</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <Crown className="h-4 w-4" />
              <span>Premium badge</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          Získajte viac zákazníkov s premium účtom. Vaš profil sa zobrazí na prvých miestach a získate premium badge.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Star className="h-4 w-4" />
            <span>Prioritné zobrazenie</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <TrendingUp className="h-4 w-4" />
            <span>3x viac zákazníkov</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Crown className="h-4 w-4" />
            <span>Premium badge</span>
          </div>
        </div>

        <Button onClick={handleUpgrade} className="w-full">
          <Crown className="h-4 w-4 mr-2" />
          Aktivovať Premium
        </Button>
      </CardContent>
    </Card>
  );
};

export default ToppedCraftsmanFeature;
