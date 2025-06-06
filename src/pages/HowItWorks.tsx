
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MessageCircle, 
  Star, 
  Calendar,
  UserPlus,
  FileText,
  CheckCircle,
  Users,
  Hammer,
  Clock,
  Euro,
  Eye,
  ArrowRight,
  Bell
} from "lucide-react";

const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'craftsman'>('customer');

  const customerSteps = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "1. Vyhľadajte remeselníka",
      description: "Prehliadajte si profily remeselníkov podľa kategórie alebo lokality. Pozrite si ich portfolio, hodnotenia a skúsenosti.",
      details: "• Použite vyhľadávanie podľa profesie (elektrikár, inštalatér, atď.)\n• Filtrovanie podľa lokality\n• Prezerajte si portfolio a hodnotenia\n• Čítajte recenzie od iných zákazníkov"
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "2. Vytvorte požiadavku",
      description: "Popíšte svoju zákazku, pridajte fotky a zverejnite požiadavku. Remeselníci vám budú odpovedať s ponukami.",
      details: "• Vytvorte detailný popis práce\n• Pridajte fotografie problému alebo priestoru\n• Špecifikujte lokalitu a termín\n• Čakajte na odpovede od remeselníkov"
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: "3. Komunikujte s remeselníkmi",
      description: "Chatujte priamo s remeselníkmi, dohodnite si detaily práce, cenu a termín realizácie.",
      details: "• Diskutujte o detailoch zákazky\n• Vyjednávajte o cene\n• Dohodnite si termín návštevy alebo práce\n• Pýtajte sa na všetko, čo potrebujete vedieť"
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "4. Vytvorte rezerváciu",
      description: "V chate vytvorte booking request s konkrétnym dátumom a časom. Remeselník požiadavku schváli alebo upraví.",
      details: "• Kliknite na 'Create Booking' v chate\n• Vyberte dátum a čas\n• Pridajte dodatočné informácie\n• Čakajte na potvrdenie od remeselníka"
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-primary" />,
      title: "5. Spravujte zákazky",
      description: "Sledujte schválené rezervácie v sekcii 'Zákazky'. Pripravte sa na návštevu remeselníka.",
      details: "• Zobrazujte si všetky schválené termíny\n• Pripravte priestor pre prácu\n• Kontaktujte remeselníka pri problémoch\n• Sledujte priebeh realizácie"
    },
    {
      icon: <Star className="h-10 w-10 text-primary" />,
      title: "6. Ohodnoťte prácu",
      description: "Po dokončení práce zanechajte hodnotenie a recenziu. Pomôžte iným zákazníkom s rozhodnutím.",
      details: "• Ohodnoťte kvalitu práce hviezdičkami\n• Napíšte podrobnú recenziu\n• Zdôraznite pozitíva aj negatíva\n• Vaše hodnotenie pomôže iným zákazníkom"
    }
  ];

  const craftsmanSteps = [
    {
      icon: <UserPlus className="h-10 w-10 text-primary" />,
      title: "1. Vytvorte profil",
      description: "Zaregistrujte sa ako remeselník, vyplňte svoj profil a pridajte portfólio svojich prác.",
      details: "• Vyplňte všetky údaje o sebe\n• Pridajte fotografie svojich prác\n• Špecifikujte svoje zručnosti\n• Nastavte svoju lokalitu a dosah"
    },
    {
      icon: <Eye className="h-10 w-10 text-primary" />,
      title: "2. Sledujte požiadavky",
      description: "V sekcii 'Požiadavky' prehliadajte zákaznícke požiadavky vo vašej oblasti a kategórii.",
      details: "• Denne kontrolujte nové požiadavky\n• Filtrovanie podľa lokality a kategórie\n• Čítajte podrobné popisy zákaziek\n• Posudzujte, či je práca pre vás vhodná"
    },
    {
      icon: <ArrowRight className="h-10 w-10 text-primary" />,
      title: "3. Odpovedajte na požiadavky",
      description: "Pošlite ponuku na zákazky, ktoré vás zaujímajú. Popíšte svoj prístup a navrhnutú cenu.",
      details: "• Napíšte profesionálnu odpoveď\n• Popíšte váš prístup k riešeniu\n• Navrhnutú cenu a termín\n• Zdôraznite svoje skúsenosti"
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: "4. Komunikujte so zákazníkmi",
      description: "V sekcii 'Správy' chatujte so zákazníkmi, upresnite detaily a dohodnite si podmienky.",
      details: "• Odpovedajte rýchlo na správy\n• Buďte profesionálni a priateľskí\n• Objasňujte všetky detaily práce\n• Dohodnite si presné podmienky"
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "5. Spravujte rezervácie",
      description: "Schvaľujte alebo upravujte booking requesty od zákazníkov. Potvrdzujte termíny.",
      details: "• Skontrolujte svoju dostupnosť\n• Potvrďte alebo navrhnuté iný termín\n• Pripravte sa na návštevu\n• Dodržiavajte dohodnuté termíny"
    },
    {
      icon: <Hammer className="h-10 w-10 text-primary" />,
      title: "6. Realizujte prácu",
      description: "Vykonajte kvalitnú prácu, dokumentujte ju fotografiami a pridajte do portfólia.",
      details: "• Dodržiavajte dohodnuté podmienky\n• Pracujte kvalitne a profesionálne\n• Dokumentujte prácu fotografiami\n• Pridajte výsledok do svojho portfólia"
    }
  ];

  const platformFeatures = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Požiadavky vs. Priamy kontakt",
      description: "Požiadavky sú verejné zákazky, kde zákazník popíše prácu a čaká na ponuky. Priamy kontakt je okamžitá komunikácia s konkrétnym remeselníkom."
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Booking systém",
      description: "V chate môžete vytvoriť booking request s konkrétnym dátumom a časom. Remeselník ho môže potvrdiť alebo navrhnúť iný termín."
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Hodnotenia a recenzie",
      description: "Po dokončení práce môžu zákazníci hodnotiť remeselníkov. Hodnotenia pomáhajú iným zákazníkom pri výbere."
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: "Notifikácie",
      description: "Dostávajte upozornenia na nové správy, odpovede na požiadavky a potvrdenia rezervácií."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Ako to funguje?
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Kompletný návod na používanie platformy Majstri.sk
            </p>
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm border">
                <Button
                  variant={activeTab === 'customer' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('customer')}
                  className="mr-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Pre zákazníkov
                </Button>
                <Button
                  variant={activeTab === 'craftsman' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('craftsman')}
                >
                  <Hammer className="h-4 w-4 mr-2" />
                  Pre remeselníkov
                </Button>
              </div>
            </div>
          </div>

          {/* Customer Instructions */}
          {activeTab === 'customer' && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Návod pre zákazníkov
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {customerSteps.map((step, index) => (
                  <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        {step.icon}
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <div className="text-sm text-gray-500 whitespace-pre-line">
                        {step.details}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Craftsman Instructions */}
          {activeTab === 'craftsman' && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Návod pre remeselníkov
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {craftsmanSteps.map((step, index) => (
                  <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        {step.icon}
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <div className="text-sm text-gray-500 whitespace-pre-line">
                        {step.details}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Platform Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Kľúčové funkcie platformy
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      {feature.icon}
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Tipy pre úspešné používanie
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Pre zákazníkov:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Buďte konkrétni v popisoch zákaziek</li>
                  <li>• Pridajte kvalitné fotografie</li>
                  <li>• Komunikujte pravidelne s remeselníkmi</li>
                  <li>• Hodnotte prácu po dokončení</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Pre remeselníkov:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Udržiavajte aktuálne portfólio</li>
                  <li>• Odpovedajte rýchlo na správy</li>
                  <li>• Buďte profesionálni v komunikácii</li>
                  <li>• Dodržiavajte dohodnuté termíny</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
