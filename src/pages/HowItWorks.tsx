
import React from "react";
import Layout from "@/components/Layout";
import { Check } from "lucide-react";

const HowItWorks: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Ako to funguje?
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Jednoduchý návod na používanie platformy Majstri.com
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Pre zákazníkov */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Pre zákazníkov</h2>
              </div>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Vyber si kategóriu</h3>
                    <p className="mt-1 text-gray-600">
                      Prejdi si zoznam remeselníkov podľa kategórie (napr. murár, elektrikár, maliar...) a podľa mesta, kde potrebuješ pomoc.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Prezri si profily</h3>
                    <p className="mt-1 text-gray-600">
                      Porovnaj hodnotenia, portfólio, skúsenosti a dostupné termíny.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Kontaktuj majstra</h3>
                    <p className="mt-1 text-gray-600">
                      Použi chat na stránke a dohodni sa priamo s majstrom na podrobnostiach zákazky.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Rezervuj termín</h3>
                    <p className="mt-1 text-gray-600">
                      Vyber si voľný dátum v kalendári majstra a odošli požiadavku. Majster ju musí potvrdiť, aby bola rezervácia platná.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Ohodnoť po dokončení práce</h3>
                    <p className="mt-1 text-gray-600">
                      Po ukončení práce môžeš majstra ohodnotiť a tým pomôcť aj ostatným používateľom.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pre majstrov */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Pre majstrov</h2>
              </div>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Zaregistruj sa a vytvor si profil</h3>
                    <p className="mt-1 text-gray-600">
                      Vyplň základné údaje, pridaj fotografie svojej práce a nastav si lokalitu pôsobenia.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Uprav si dostupnosť</h3>
                    <p className="mt-1 text-gray-600">
                      Označ v kalendári dni, kedy si voľný, aby ťa mohli zákazníci kontaktovať a rezervovať si termín.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Komunikuj so zákazníkmi</h3>
                    <p className="mt-1 text-gray-600">
                      Pomocou vstavaného chatu sa dohodni na detailoch zákazky.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Získavaj recenzie</h3>
                    <p className="mt-1 text-gray-600">
                      Po dokončení zákazky zákazníci môžu ohodnotiť tvoju prácu – dobré hodnotenie ti pomôže získať ďalších klientov.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Zvýrazni svoj profil (voliteľné)</h3>
                    <p className="mt-1 text-gray-600">
                      Chceš byť viditeľnejší? Ponúkame možnosť „topovania" profilu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">
              Máte ďalšie otázky? Neváhajte nás kontaktovať.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Kontaktujte nás
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
