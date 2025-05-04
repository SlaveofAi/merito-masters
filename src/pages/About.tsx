
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('about_us')}</h1>
        
        <div className="prose max-w-none">
          <p className="mb-6 text-muted-foreground">
            Majstri.com je moderná online platforma, ktorá prepája šikovných remeselníkov a profesionálov so zákazníkmi po celom Slovensku. 
            Naším cieľom je zjednodušiť vyhľadávanie spoľahlivých majstrov a umožniť im budovať si dôveru cez reálne hodnotenia, 
            fotografie projektov a priamu komunikáciu so zákazníkmi.
          </p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Prečo vznikla platforma Majstri.com?</h2>
            <p className="text-muted-foreground">
              Zháňať kvalitného remeselníka býva často stresujúce. Na druhej strane, mnoho skúsených odborníkov má problém získať nových 
              klientov len na základe odporúčaní. Majstri.com vzniklo ako jednoduché riešenie – transparentné, dôveryhodné a spravodlivé 
              pre obe strany.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Čo ponúkame?</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Pre zákazníkov:</h3>
            <p className="text-muted-foreground mb-4">
              Rýchle vyhľadanie remeselníkov vo svojom okolí, reálne recenzie, možnosť prezrieť si portfólio prác, 
              komunikovať cez chat a vytvoriť rezerváciu termínu.
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Pre majstrov:</h3>
            <p className="text-muted-foreground">
              Možnosť bezplatne sa zaregistrovať, vytvoriť si profil s fotkami svojich prác, budovať si reputáciu cez hodnotenia 
              a získať nových klientov bez nutnosti zložitej reklamy.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Naša vízia</h2>
            <p className="text-muted-foreground">
              Chceme, aby sa Majstri.com stali synonymom kvality, dôvery a remeselnej zručnosti. Platforma má potenciál rásť a rozvíjať sa 
              – v budúcnosti plánujeme pridať platobný systém, rozšírené možnosti správy rezervácií a ďalšie užitočné nástroje 
              pre remeselníkov aj zákazníkov.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;
