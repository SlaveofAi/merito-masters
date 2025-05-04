
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t, language } = useLanguage();
  
  // Different content based on language
  const getContent = () => {
    switch (language) {
      case 'cs':
        return {
          intro: "Majstri.com je moderní online platforma, která propojuje šikovné řemeslníky a profesionály se zákazníky po celém Česku. Naším cílem je zjednodušit vyhledávání spolehlivých řemeslníků a umožnit jim budovat si důvěru přes reálná hodnocení, fotografie projektů a přímou komunikaci se zákazníky.",
          whyTitle: "Proč vznikla platforma Majstri.com?",
          whyText: "Shánět kvalitního řemeslníka bývá často stresující. Na druhou stranu, mnoho zkušených odborníků má problém získat nové klienty pouze na základě doporučení. Majstri.com vzniklo jako jednoduché řešení – transparentní, důvěryhodné a spravedlivé pro obě strany.",
          offerTitle: "Co nabízíme?",
          customersTitle: "Pro zákazníky:",
          customersText: "Rychlé vyhledání řemeslníků ve svém okolí, reálné recenze, možnost prohlédnout si portfolio prací, komunikovat přes chat a vytvořit rezervaci termínu.",
          craftsmenTitle: "Pro řemeslníky:",
          craftsmenText: "Možnost bezplatně se zaregistrovat, vytvořit si profil s fotkami svých prací, budovat si reputaci přes hodnocení a získat nové klienty bez nutnosti složité reklamy.",
          visionTitle: "Naše vize",
          visionText: "Chceme, aby se Majstri.com stali synonymem kvality, důvěry a řemeslné zručnosti. Platforma má potenciál růst a rozvíjet se – v budoucnosti plánujeme přidat platební systém, rozšířené možnosti správy rezervací a další užitečné nástroje pro řemeslníky i zákazníky."
        };
        
      case 'en':
        return {
          intro: "Majstri.com is a modern online platform connecting skilled craftsmen and professionals with customers across the country. Our goal is to simplify the search for reliable craftsmen and enable them to build trust through real reviews, project photos, and direct communication with customers.",
          whyTitle: "Why was Majstri.com created?",
          whyText: "Finding a quality craftsman can be stressful. On the other hand, many experienced professionals struggle to get new clients based solely on recommendations. Majstri.com was created as a simple solution – transparent, trustworthy, and fair for both sides.",
          offerTitle: "What we offer?",
          customersTitle: "For customers:",
          customersText: "Quick search for craftsmen in your area, real reviews, the ability to browse work portfolios, communicate via chat, and create appointment reservations.",
          craftsmenTitle: "For craftsmen:",
          craftsmenText: "The opportunity to register for free, create a profile with photos of your work, build a reputation through reviews, and acquire new clients without the need for complex advertising.",
          visionTitle: "Our vision",
          visionText: "We want Majstri.com to become synonymous with quality, trust, and craftsmanship. The platform has the potential to grow and develop – in the future, we plan to add a payment system, extended reservation management options, and other useful tools for craftsmen and customers."
        };
        
      default: // Slovak
        return {
          intro: "Majstri.com je moderná online platforma, ktorá prepája šikovných remeselníkov a profesionálov so zákazníkmi po celom Slovensku. Naším cieľom je zjednodušiť vyhľadávanie spoľahlivých majstrov a umožniť im budovať si dôveru cez reálne hodnotenia, fotografie projektov a priamu komunikáciu so zákazníkmi.",
          whyTitle: "Prečo vznikla platforma Majstri.com?",
          whyText: "Zháňať kvalitného remeselníka býva často stresujúce. Na druhej strane, mnoho skúsených odborníkov má problém získať nových klientov len na základe odporúčaní. Majstri.com vzniklo ako jednoduché riešenie – transparentné, dôveryhodné a spravodlivé pre obe strany.",
          offerTitle: "Čo ponúkame?",
          customersTitle: "Pre zákazníkov:",
          customersText: "Rýchle vyhľadanie remeselníkov vo svojom okolí, reálne recenzie, možnosť prezrieť si portfólio prác, komunikovať cez chat a vytvoriť rezerváciu termínu.",
          craftsmenTitle: "Pre majstrov:",
          craftsmenText: "Možnosť bezplatne sa zaregistrovať, vytvoriť si profil s fotkami svojich prác, budovať si reputáciu cez hodnotenia a získať nových klientov bez nutnosti zložitej reklamy.",
          visionTitle: "Naša vízia",
          visionText: "Chceme, aby sa Majstri.com stali synonymom kvality, dôvery a remeselnej zručnosti. Platforma má potenciál rásť a rozvíjať sa – v budúcnosti plánujeme pridať platobný systém, rozšírené možnosti správy rezervácií a ďalšie užitočné nástroje pre remeselníkov aj zákazníkov."
        };
    }
  };
  
  const content = getContent();
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('about_us')}</h1>
        
        <div className="prose max-w-none">
          <p className="mb-6 text-muted-foreground">
            {content.intro}
          </p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{content.whyTitle}</h2>
            <p className="text-muted-foreground">
              {content.whyText}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{content.offerTitle}</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">{content.customersTitle}</h3>
            <p className="text-muted-foreground mb-4">
              {content.customersText}
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">{content.craftsmenTitle}</h3>
            <p className="text-muted-foreground">
              {content.craftsmenText}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{content.visionTitle}</h2>
            <p className="text-muted-foreground">
              {content.visionText}
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;

