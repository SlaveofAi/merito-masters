
import React from "react";
import Layout from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">O nás</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <p className="text-lg text-gray-700 mb-6">
              Majstri.com je moderná online platforma, ktorá prepája šikovných remeselníkov a profesionálov so zákazníkmi po celom Slovensku. Naším cieľom je zjednodušiť vyhľadávanie spoľahlivých majstrov a umožniť im budovať si dôveru cez reálne hodnotenia, fotografie projektov a priamu komunikáciu so zákazníkmi.
            </p>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Prečo vznikla platforma Majstri.com?</h2>
              <p className="text-gray-600 mb-4">
                Zháňať kvalitného remeselníka býva často stresujúce. Na druhej strane, mnoho skúsených odborníkov má problém získať nových klientov len na základe odporúčaní. Majstri.sk vzniklo ako jednoduché riešenie – transparentné, dôveryhodné a spravodlivé pre obe strany.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Čo ponúkame?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Pre zákazníkov:</h3>
                  <p className="text-gray-600">
                    Rýchle vyhľadanie remeselníkov vo svojom okolí, reálne recenzie, možnosť prezrieť si portfólio prác, komunikovať cez chat a vytvoriť rezerváciu termínu.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Pre majstrov:</h3>
                  <p className="text-gray-600">
                    Možnosť bezplatne sa zaregistrovať, vytvoriť si profil s fotkami svojich prác, budovať si reputáciu cez hodnotenia a získať nových klientov bez nutnosti zložitej reklamy.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Naša vízia</h2>
              <p className="text-gray-600">
                Chceme, aby sa Majstri.sk stali synonymom kvality, dôvery a remeselnej zručnosti. Platforma má potenciál rásť a rozvíjať sa – v budúcnosti plánujeme pridať platobný systém, rozšírené možnosti správy rezervácií a ďalšie užitočné nástroje pre remeselníkov aj zákazníkov.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
