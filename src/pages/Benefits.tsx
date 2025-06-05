
import React from "react";
import Layout from "@/components/Layout";
import { User, Users } from "lucide-react";

const Benefits = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Výhody registrácie</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pre remeselníkov */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Pre remeselníkov</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Vlastný profesionálny profil</h3>
                  <p className="text-gray-600">Prezentujte svoju prácu pomocou fotografií, popisov a hodnotení.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Získavanie nových zákazníkov</h3>
                  <p className="text-gray-600">Buďte viditeľní pre ľudí vo vašom okolí, ktorí hľadajú spoľahlivého majstra.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kalendár dostupnosti</h3>
                  <p className="text-gray-600">Nastavte si, kedy ste k dispozícii, a zákazníci vás môžu jednoducho kontaktovať.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Chat so zákazníkmi</h3>
                  <p className="text-gray-600">Priama a rýchla komunikácia s klientmi cez platformu.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Možnosť topovania profilu</h3>
                  <p className="text-gray-600">Zvýšte svoju viditeľnosť medzi ostatnými.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Zbieranie recenzií</h3>
                  <p className="text-gray-600">Budujte si dôveryhodnosť pomocou spätnej väzby od zákazníkov.</p>
                </div>
              </div>
            </div>

            {/* Pre zákazníkov */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Pre zákazníkov</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Jednoduché vyhľadávanie odborníkov</h3>
                  <p className="text-gray-600">Nájdite majstra podľa remesla a lokality.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Transparentné profily s recenziami</h3>
                  <p className="text-gray-600">Overte si kvalitu ešte pred kontaktovaním.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Rezervácia termínu online</h3>
                  <p className="text-gray-600">Vyberte si čas a dátum, ktorý vám vyhovuje.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Priamy kontakt cez chat</h3>
                  <p className="text-gray-600">Žiadne sprostredkovateľské poplatky, komunikujete priamo.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">História objednávok a hodnotení</h3>
                  <p className="text-gray-600">Majte prehľad o svojich dopytoch.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Benefits;
