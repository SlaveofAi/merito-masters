
import React from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedCraftsmen from "@/components/FeaturedCraftsmen";
import { Button } from "@/components/ui/button";
import { Check, Star, Users, Shield } from "lucide-react";

const features = [
  {
    icon: <Check className="h-6 w-6" />,
    title: "Overení remeselníci",
    description:
      "Všetci remeselníci prechádzajú overením ich odbornosti a kvalifikácie.",
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Hodnotenia a recenzie",
    description:
      "Reálne hodnotenia od zákazníkov, ktorí využili služby remeselníkov.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Široká sieť odborníkov",
    description:
      "Stovky remeselníkov z rôznych odborov z celého Slovenska.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Bezpečné platby",
    description:
      "Všetky platby sú zabezpečené a spracované bezpečnými metódami.",
  },
];

const categories = [
  { name: "Stolári", count: 42 },
  { name: "Elektrikári", count: 38 },
  { name: "Maliari", count: 27 },
  { name: "Inštalatéri", count: 31 },
  { name: "Murári", count: 25 },
  { name: "Záhradníci", count: 19 },
  { name: "Podlahári", count: 23 },
  { name: "Kúrenári", count: 18 },
];

const Index = () => {
  return (
    <Layout>
      <Hero />

      {/* Features Section */}
      <section className="section-padding bg-secondary relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent)] pointer-events-none"></div>
        
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-3">
            Prečo si vybrať Majstri.sk
          </h2>
          <p className="text-muted-foreground">
            Platforma, ktorá mení spôsob, akým hľadáte a spolupracujete s profesionálnymi remeselníkmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-border/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
                {feature.icon}
              </div>
              <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-3">
            Objavte kategórie remeselníkov
          </h2>
          <p className="text-muted-foreground">
            Prehľadajte našu širokú ponuku remeselníkov podľa odboru
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="bg-white hover:bg-secondary/50 border border-border/50 rounded-lg p-5 text-center transition-colors cursor-pointer"
            >
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} remeselníkov</p>
            </div>
          ))}
        </div>
      </section>

      <FeaturedCraftsmen />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">
            Ste remeselník hľadajúci nových zákazníkov?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            Pridajte sa k stovkám profesionálnych remeselníkov na našej platforme a získajte prístup k novým zákazníkom.
          </p>
          <Button variant="outline" size="lg">
            Zaregistrujte sa zadarmo
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
