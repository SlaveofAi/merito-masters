
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const Pricing = () => {
  const { user } = useAuth();
  const { subscriptionData, createCheckout, openCustomerPortal } = useSubscription();

  const plans = [
    {
      name: "Basic",
      price: "€9.99",
      period: "/mesiac",
      description: "Perfektné pre začiatočníkov",
      features: [
        "Až 5 požiadaviek mesačne",
        "Základná podpora",
        "Email notifikácie",
        "Prístup k remeselnikom"
      ],
      planId: "basic",
      popular: false
    },
    {
      name: "Premium",
      price: "€19.99",
      period: "/mesiac",
      description: "Pre aktívnych používateľov",
      features: [
        "Neobmedzené požiadavky",
        "Prioritná podpora",
        "SMS notifikácie",
        "Prístup k všetkým remeselnikom",
        "Pokročilé filtrovanie",
        "Detailné štatistiky"
      ],
      planId: "premium",
      popular: true
    },
    {
      name: "Enterprise",
      price: "€49.99",
      period: "/mesiac",
      description: "Pre firmy a profesionálov",
      features: [
        "Všetky Premium funkcie",
        "Dedikovaný account manager",
        "API prístup",
        "Vlastné branding",
        "Bulk operácie",
        "24/7 telefonická podpora",
        "SLA garancia"
      ],
      planId: "enterprise",
      popular: false
    }
  ];

  const handlePlanSelect = (planId: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (subscriptionData.subscribed) {
      openCustomerPortal();
    } else {
      createCheckout(planId);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionData.subscribed && 
           subscriptionData.subscription_tier?.toLowerCase() === planId;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Cenové plány</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Vyberte si plán, ktorý najlepšie vyhovuje vašim potrebám
          </p>
          {subscriptionData.subscribed && (
            <div className="mt-6">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Aktívne predplatné: {subscriptionData.subscription_tier}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.planId} 
              className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''} ${isCurrentPlan(plan.planId) ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Najpopulárnejší
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan(plan.planId) && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Váš plán
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handlePlanSelect(plan.planId)}
                  className="w-full"
                  variant={isCurrentPlan(plan.planId) ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan(plan.planId)}
                >
                  {!user ? "Prihlásiť sa" : 
                   isCurrentPlan(plan.planId) ? "Aktívny plán" :
                   subscriptionData.subscribed ? "Zmeniť plán" : 
                   "Vybrať plán"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {subscriptionData.subscribed && (
          <div className="text-center mt-12">
            <Button onClick={openCustomerPortal} variant="outline">
              Spravovať predplatné
            </Button>
          </div>
        )}

        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>Všetky plány môžete kedykoľvek zrušiť. Bez dlhodobých záväzkov.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
