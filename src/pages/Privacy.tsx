
import React from "react";
import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Politika ochrany osobných údajov</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <p className="text-gray-600 mb-6">
              <strong>Dátum poslednej aktualizácie:</strong> 4. máj 2025
            </p>
            <p className="text-gray-600 mb-6">
              Týmto dokumentom ťa informujeme o tom, ako spracúvame tvoje osobné údaje pri používaní platformy Majstri.sk.
            </p>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Kto spracúva tvoje údaje?</h2>
              <p className="text-gray-600">
                Prevádzkovateľom osobných údajov je fyzická osoba, ktorú môžeš kontaktovať na e-mailovej adrese: info@maj-stri.com
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Aké údaje spracúvame?</h2>
              <p className="text-gray-600 mb-3">
                Pri registrácii alebo používaní stránky spracúvame tieto osobné údaje:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mb-3">
                <li>Meno a priezvisko</li>
                <li>E-mailová adresa</li>
                <li>Telefónne číslo</li>
                <li>Mesto bydliska</li>
              </ul>
              <p className="text-gray-600">
                Tieto údaje nám slúžia na umožnenie registrácie, vytvorenie profilu, zobrazenie tvojej ponuky služieb, kontakt medzi používateľmi a správne fungovanie platformy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Na aký účel používame tvoje údaje?</h2>
              <p className="text-gray-600 mb-3">
                Tvoje údaje spracúvame za týmito účelmi:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mb-3">
                <li>Registrácia a vedenie používateľského účtu</li>
                <li>Vytvorenie a zobrazenie profilu remeselníka</li>
                <li>Sprostredkovanie kontaktu medzi zákazníkmi a remeselníkmi</li>
                <li>Posielanie systémových správ a oznamov</li>
              </ul>
              <p className="text-gray-600">
                V budúcnosti môžeme použiť tvoju e-mailovú adresu aj na zasielanie dôležitých noviniek týkajúcich sa fungovania platformy (nie marketing)
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Kto má k údajom prístup?</h2>
              <p className="text-gray-600">
                V súčasnosti má prístup k údajom iba prevádzkovateľ. V budúcnosti môže byť zabezpečený prístup pre externých vývojárov alebo technickú podporu, a to výhradne za účelom údržby a rozvoja platformy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Ako dlho tvoje údaje uchovávame?</h2>
              <p className="text-gray-600">
                Tvoje údaje budeme uchovávať po dobu aktívneho používania profilu. Ak nebudeš účet používať viac než 5 rokov, budú tvoje údaje z databázy vymazané.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Používanie cookies</h2>
              <p className="text-gray-600">
                Momentálne stránka nepoužíva cookies, ale ich zavedenie je plánované do budúcnosti. Ak budú zavedené, informácie o ich účele a spracovaní budú doplnené a zverejnené na tejto stránke.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Prenos údajov mimo EÚ</h2>
              <p className="text-gray-600">
                Niektoré nástroje, ktoré môžeme použiť v budúcnosti (napr. analytika, e-mailové služby), môžu sídliť mimo Európskej únie. V takom prípade zabezpečíme, aby bol prenos údajov chránený podľa platnej legislatívy (napr. zmluvné doložky alebo iné mechanizmy podľa GDPR).
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Tvoje práva</h2>
              <p className="text-gray-600 mb-3">
                Ako používateľ máš právo:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mb-3">
                <li>požiadať o prístup k svojim osobným údajom,</li>
                <li>požiadať o opravu alebo vymazanie údajov,</li>
                <li>namietať proti spracovaniu,</li>
                <li>kedykoľvek požiadať o zrušenie účtu a vymazanie všetkých údajov.</li>
              </ul>
              <p className="text-gray-600">
                Ak chceš uplatniť ktorékoľvek z týchto práv, kontaktuj nás na: info@maj-stri.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
