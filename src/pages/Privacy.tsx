
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Ochrana súkromia</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Zbieranie údajov</h2>
            <p className="text-muted-foreground mb-4">
              Zbierame len tie osobné údaje, ktoré sú nevyhnutné pre fungovanie našej platformy:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Meno a priezvisko</li>
              <li>E-mailová adresa</li>
              <li>Telefónne číslo</li>
              <li>Adresa (pre remeselníkov)</li>
              <li>Fotografie profilov a projektov</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Použitie údajov</h2>
            <p className="text-muted-foreground mb-4">
              Vaše údaje používame výlučne na:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Vytvorenie a správu vašeho účtu</li>
              <li>Umožnenie komunikácie medzi používateľmi</li>
              <li>Zlepšovanie našich služieb</li>
              <li>Zasielanie dôležitých oznámení</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Zdieľanie údajov</h2>
            <p className="text-muted-foreground">
              Vaše osobné údaje nepredávame ani neprenajímame tretím stranám. 
              Údaje môžu byť zdieľané len v prípade zákonnej požiadavky alebo s vaším výslovným súhlasom.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Bezpečnosť údajov</h2>
            <p className="text-muted-foreground">
              Používame moderné bezpečnostné opatrenia na ochranu vašich údajov vrátane 
              šifrovania a bezpečného uloženia v databáze.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Vaše práva</h2>
            <p className="text-muted-foreground mb-4">
              Máte právo na:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Prístup k vašim údajom</li>
              <li>Opravu nesprávnych údajov</li>
              <li>Vymazanie vašich údajov</li>
              <li>Prenosnosť údajov</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Kontakt</h2>
            <p className="text-muted-foreground">
              V prípade otázok ohľadom ochrany súkromia nás kontaktujte na: 
              <a href="mailto:info@maj-stri.com" className="text-primary hover:underline ml-1">
                info@maj-stri.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
