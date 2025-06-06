
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Podmienky používania</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Všeobecné ustanovenia</h2>
            <p className="text-muted-foreground">
              Tieto podmienky používania upravujú vzťah medzi prevádzkovateľom platformy Majstri.com 
              a používateľmi tejto služby. Používaním našej platformy súhlasíte s týmito podmienkami.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Registrácia a účet</h2>
            <p className="text-muted-foreground mb-4">
              Pri registrácii sa zaväzujete poskytovať pravdivé a aktuálne informácie. 
              Ste zodpovední za bezpečnosť vašich prihlasovacích údajov.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Pravidlá správania</h2>
            <p className="text-muted-foreground mb-4">
              Používatelia sa zaväzujú:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Používať platformu len na zákonné účely</li>
              <li>Nepublikovať nevhodný alebo urážlivý obsah</li>
              <li>Rešpektovať práva ostatných používateľov</li>
              <li>Nezneužívať systém hodnotení a recenzií</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Zodpovednosť</h2>
            <p className="text-muted-foreground">
              Majstri.com slúži ako sprostredkovateľ medzi remeselníkmi a zákazníkmi. 
              Nezodpovedáme za kvalitu vykonaných prác ani za škody vzniknuté pri ich realizácii.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Ukončenie účtu</h2>
            <p className="text-muted-foreground">
              Účet môže byť ukončený používateľom kedykoľvek alebo administrátorom 
              v prípade porušenia týchto podmienok.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Zmeny podmienok</h2>
            <p className="text-muted-foreground">
              Vyhradzujeme si právo kedykoľvek zmeniť tieto podmienky. 
              O zmenách budeme používateľov informovať vopred.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Kontakt</h2>
            <p className="text-muted-foreground">
              V prípade otázok nás kontaktujte na: 
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

export default Terms;
