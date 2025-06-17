
import React from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedCraftsmen from "@/components/FeaturedCraftsmen";
import { Button } from "@/components/ui/button";
import { Check, Shield, Clock, Star, Users, Award } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <Check className="h-5 w-5" />,
      title: "100% zadarmo",
      description: "Bez skrytých poplatkov"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Transparentné",
      description: "Overené recenzie a hodnotenia"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Jednoduché použitie",
      description: "Nájdite remeselníka za pár kliknutí"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Kvalitní majstri",
      description: "Len overení odborníci"
    }
  ];

  const categories = [
    "Elektrikár", "Stolár", "Maliar", "Inštalatér", 
    "Murár", "Kľučkár", "Záhradník", "Čistenie"
  ];

  const stats = [
    { number: "500+", label: "Remeselníkov" },
    { number: "1000+", label: "Spokojných zákazníkov" },
    { number: "50+", label: "Miest na Slovensku" },
    { number: "4.8", label: "Priemerné hodnotenie" }
  ];

  return (
    <Layout>
      <Hero />
      
      {/* Feature badges section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedCraftsmen />

      {/* Categories section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Populárne kategórie
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vyberte si z najžiadanejších remesiel a služieb
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 text-base hover:bg-primary hover:text-white transition-colors"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Dôveruje nám tisícky zákazníkov
            </h2>
            <p className="text-xl opacity-90">
              Spojujeme kvalitných remeselníkov so spokojenými zákazníkmi
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ako to funguje?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jednoduchý proces v troch krokoch
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Opíšte prácu</h3>
              <p className="text-gray-600">
                Zadajte detaily o práci, ktorú potrebujete urobiť
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Dostanete ponuky</h3>
              <p className="text-gray-600">
                Kvalifikovaní remeselníci vám pošlú svoje cenové ponuky
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Vyberte najlepšieho</h3>
              <p className="text-gray-600">
                Porovnajte ponuky a vyberte si toho najvhodnejšieho majstra
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Začnite ešte dnes
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Pripojte sa k tisíckam spokojných zákazníkov a nájdite svojho ideálneho remeselníka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Zverejniť požiadavku
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Prehliadať remeselníkov
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
