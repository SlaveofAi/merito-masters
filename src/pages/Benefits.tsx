
import React from "react";
import Layout from "@/components/Layout";
import { Star, Shield, Users, Zap } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: Star,
      title: "Zvýšte svoju viditeľnosť",
      description: "Vaš profil uvidia tisíce potenciálnych zákazníkov denne."
    },
    {
      icon: Shield,
      title: "Overená platforma",
      description: "Bezpečné prostredie s overeným systémom hodnotení."
    },
    {
      icon: Users,
      title: "Široká zákaznícka základňa",
      description: "Prístup k zákazníkom z celého Slovenska."
    },
    {
      icon: Zap,
      title: "Rýchla komunikácia",
      description: "Okamžité notifikácie o nových požiadavkách."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Výhody registrácie</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Cenník služieb</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold">Základný profil</h3>
                <p className="text-gray-600">Bezplatne - Základné údaje a kontakt</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold">Premium profil</h3>
                <p className="text-gray-600">19.99€/mesiac - Rozšírené portfólio a vyššie umiestnenie</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">TOP pozícia</h3>
                <p className="text-gray-600">39.99€/mesiac - Zvýraznenie profilu na prvých miestach</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Benefits;
