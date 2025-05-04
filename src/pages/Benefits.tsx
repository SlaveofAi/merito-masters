
import React from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Hammer,
  Users,
  Calendar,
  MessageSquare,
  Star
} from "lucide-react";

const Benefits: React.FC = () => {
  const craftsBenefits = [
    { 
      title: "Vlastný profesionálny profil", 
      description: "Prezentujte svoju prácu pomocou fotografií, popisov a hodnotení.",
      icon: <Users className="h-6 w-6 text-primary" />
    },
    { 
      title: "Získavanie nových zákazníkov", 
      description: "Buďte viditeľní pre ľudí vo vašom okolí, ktorí hľadajú spoľahlivého majstra.",
      icon: <Users className="h-6 w-6 text-primary" />
    },
    { 
      title: "Kalendár dostupnosti", 
      description: "Nastavte si, kedy ste k dispozícii, a zákazníci vás môžu jednoducho kontaktovať.",
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    { 
      title: "Chat so zákazníkmi", 
      description: "Priama a rýchla komunikácia s klientmi cez platformu.",
      icon: <MessageSquare className="h-6 w-6 text-primary" />
    },
    { 
      title: "Možnosť topovania profilu", 
      description: "Zvýšte svoju viditeľnosť medzi ostatnými.",
      icon: <Star className="h-6 w-6 text-primary" />
    },
    { 
      title: "Zbieranie recenzií", 
      description: "Budujte si dôveryhodnosť pomocou spätnej väzby od zákazníkov.",
      icon: <Star className="h-6 w-6 text-primary" />
    }
  ];

  const customerBenefits = [
    { 
      title: "Jednoduché vyhľadávanie odborníkov", 
      description: "Nájdite majstra podľa remesla a lokality.",
      icon: <Hammer className="h-6 w-6 text-primary" />
    },
    { 
      title: "Transparentné profily s recenziami", 
      description: "Overte si kvalitu ešte pred kontaktovaním.",
      icon: <Star className="h-6 w-6 text-primary" />
    },
    { 
      title: "Rezervácia termínu online", 
      description: "Vyberte si čas a dátum, ktorý vám vyhovuje.",
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    { 
      title: "Priamy kontakt cez chat", 
      description: "Žiadne sprostredkovateľské poplatky, komunikujete priamo.",
      icon: <MessageSquare className="h-6 w-6 text-primary" />
    },
    { 
      title: "História objednávok a hodnotení", 
      description: "Majte prehľad o svojich dopytoch.",
      icon: <Users className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              ✅ Výhody registrácie
            </h1>
          </div>

          {/* Craftsmen Benefits Section */}
          <Card className="mb-10">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center">
                <Hammer className="h-6 w-6 text-primary mr-3" />
                <span>🔨 Pre remeselníkov</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {craftsBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="mr-4 mt-1">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Separator */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-4 text-gray-500 text-sm">AND</span>
            </div>
          </div>

          {/* Customers Benefits Section */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-primary mr-3" />
                <span>🧑‍🔧 Pre zákazníkov</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {customerBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="mr-4 mt-1">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Benefits;
