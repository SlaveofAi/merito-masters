
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Star, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const Pricing = () => {
  const { user } = useAuth();
  const { createToppedPayment, loading } = useSubscription();

  const handlePayment = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    createToppedPayment();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Top pozícia pre remeselníckov</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Zvýšte svoju viditeľnosť a získajte viac zákazníkov
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Crown className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-800">Top pozícia</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">€9.99</span>
                <span className="text-muted-foreground"> / 7 dní</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Zobrazenie na prvých miestach</span>
                </li>
                <li className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Až 3x viac zákazníkov</span>
                </li>
                <li className="flex items-center">
                  <Crown className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Premium badge na profile</span>
                </li>
              </ul>

              <Button 
                onClick={handlePayment}
                className="w-full"
                disabled={loading}
              >
                <Crown className="h-4 w-4 mr-2" />
                {loading ? "Spracováva sa..." : !user ? "Prihlásiť sa" : "Aktivovať za €9.99"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>Jednorazová platba za 7 dní top pozície. Bez záväzkov.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
