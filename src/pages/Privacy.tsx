
import React from "react";
import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Ochrana súkromia</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Zbieranie údajov</h2>
              <p className="text-gray-600">
                Zbierame len tie údaje, ktoré sú potrebné na poskytovanie našich služieb. 
                Patria sem kontaktné údaje, informácie o vašich službách a komunikačné preferencie.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Používanie údajov</h2>
              <p className="text-gray-600">
                Vaše údaje používame výlučne na prepájanie remeselníkov so zákazníkmi 
                a zlepšovanie kvality našich služieb.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Bezpečnosť údajov</h2>
              <p className="text-gray-600">
                Všetky údaje sú chránené moderným šifrovaním a bezpečnostnými protokolmi. 
                Vaše údaje nezdieľame s tretími stranami bez vášho súhlasu.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Vaše práva</h2>
              <p className="text-gray-600">
                Máte právo na prístup, opravu alebo vymazanie svojich údajov. 
                Kontaktujte nás na info@majstri.com pre akékoľvek požiadavky týkajúce sa vašich údajov.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
