
import React from "react";
import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Podmienky používania</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Všeobecné podmienky</h2>
              <p className="text-gray-600">
                Používaním platformy Majstri.com súhlasíte s týmito podmienkami používania. 
                Platforma slúži na prepájanie remeselníkov a zákazníkov.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Povinnosti používateľov</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Poskytovanie pravdivých a aktuálnych údajov</li>
                <li>Slušné a profesionálne správanie voči ostatným používateľom</li>
                <li>Dodržiavanie platných zákonov a predpisov</li>
                <li>Nepoužívanie platformy na nezákonné účely</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Zodpovednosť</h2>
              <p className="text-gray-600">
                Majstri.com slúži ako sprostredkovateľ. Nezodpovedáme za kvalitu vykonaných prác 
                ani za škody vzniknuté pri spolupráci medzi remeselníkmi a zákazníkmi.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Ukončenie účtu</h2>
              <p className="text-gray-600">
                Účet môžete kedykoľvek zrušiť v nastaveniach profilu. 
                Vyhradzujeme si právo zrušiť účty, ktoré porušujú tieto podmienky.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Zmeny podmienok</h2>
              <p className="text-gray-600">
                Tieto podmienky môžeme aktualizovať. O zmenách vás budeme informovať vopred 
                prostredníctvom e-mailu alebo oznámenia na platforme.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
