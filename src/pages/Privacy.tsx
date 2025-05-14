
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Politika ochrany osobných údajov</h1>
        <p className="text-muted-foreground text-center mb-8">
          Dátum poslednej aktualizácie: 4. máj 2025
        </p>
        
        <div className="prose max-w-none">
          <p className="mb-6 text-muted-foreground">
            Týmto dokumentom ťa informujeme o tom, ako spracúvame tvoje osobné údaje pri používaní platformy Majstri.com.
          </p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Kto spracúva tvoje údaje?</h2>
            <p className="text-muted-foreground">
              Prevádzkovateľom osobných údajov je fyzická osoba, ktorú môžeš kontaktovať na e-mailovej adrese: <a href="mailto:info@maj-stri.com" className="text-primary hover:underline">info@maj-stri.com</a>
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Aké údaje spracúvame?</h2>
            <p className="text-muted-foreground mb-4">
              Pri registrácii alebo používaní stránky spracúvame tieto osobné údaje:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Meno a priezvisko</li>
              <li>E-mailová adresa</li>
              <li>Telefónne číslo</li>
              <li>Mesto bydliska</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Tieto údaje nám slúžia na umožnenie registrácie, vytvorenie profilu, zobrazenie tvojej ponuky služieb, kontakt medzi používateľmi a správne fungovanie platformy.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Na aký účel používame tvoje údaje?</h2>
            <p className="text-muted-foreground mb-4">
              Tvoje údaje spracúvame za týmito účelmi:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Registrácia a vedenie používateľského účtu</li>
              <li>Vytvorenie a zobrazenie profilu remeselníka</li>
              <li>Sprostredkovanie kontaktu medzi zákazníkmi a remeselníkmi</li>
              <li>Posielanie systémových správ a oznamov</li>
              <li>V budúcnosti môžeme použiť tvoju e-mailovú adresu aj na zasielanie dôležitých noviniek týkajúcich sa fungovania platformy (nie marketing)</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Kto má k údajom prístup?</h2>
            <p className="text-muted-foreground">
              V súčasnosti má prístup k údajom iba prevádzkovateľ. V budúcnosti môže byť zabezpečený prístup pre externých vývojárov alebo technickú podporu, a to výhradne za účelom údržby a rozvoja platformy.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Ako dlho tvoje údaje uchovávame?</h2>
            <p className="text-muted-foreground">
              Tvoje údaje budeme uchovávať po dobu aktívneho používania profilu. Ak nebudeš účet používať viac než 5 rokov, budú tvoje údaje z databázy vymazané.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Používanie cookies</h2>
            <p className="text-muted-foreground">
              Momentálne stránka nepoužíva cookies, ale ich zavedenie je plánované do budúcnosti. Ak budú zavedené, informácie o ich účele a spracovaní budú doplnené a zverejnené na tejto stránke.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Prenos údajov mimo EÚ</h2>
            <p className="text-muted-foreground">
              Niektoré nástroje, ktoré môžeme použiť v budúcnosti (napr. analytika, e-mailové služby), môžu sídliť mimo Európskej únie. V takom prípade zabezpečíme, aby bol prenos údajov chránený podľa platnej legislatívy (napr. zmluvné doložky alebo iné mechanizmy podľa GDPR).
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
