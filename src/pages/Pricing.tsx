
import React from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { EuroIcon } from "lucide-react";

const Pricing: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Cenník služieb
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Pre remeselníkov
            </p>
          </div>

          <Card className="mb-12 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center mb-2">
                <div className="bg-primary/5 rounded-full p-2 mr-3">
                  <EuroIcon className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Cenová politika platformy</CardTitle>
              </div>
              <CardDescription className="text-lg text-gray-700">
                Naša platforma <strong>nezasahuje do vašich cien</strong>. Každý majster si určuje <strong>svoju vlastnú cenotvorbu</strong> podľa svojich skúseností, náročnosti práce a lokality.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Ako si nastaviť efektívny cenník?
            </h2>
            <p className="text-gray-600 mb-8">
              Tu je niekoľko odporúčaní:
            </p>

            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Zohľadni svoje náklady</h3>
                  <p className="mt-1 text-gray-600">
                    Nezabudni na materiál, cestovné náklady, čas na prípravu, administratívu a ďalšie výdavky.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Analyzuj konkurenciu</h3>
                  <p className="mt-1 text-gray-600">
                    Prezri si profily iných majstrov vo svojej kategórii a lokalite – buď konkurencieschopný, ale nepredávaj sa pod cenu.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Buď transparentný</h3>
                  <p className="mt-1 text-gray-600">
                    Zákazníci ocenia jasne stanovené ceny. Pokús sa dopredu odhadnúť cenu práce alebo aspoň uviesť orientačný rozsah (napr. 50–80 €/hod).
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Uveď, čo cena zahŕňa</h3>
                  <p className="mt-1 text-gray-600">
                    Čím viac informácií dáš, tým menej nedorozumení. Napíš, či cena zahŕňa materiál, dopravu, alebo len samotnú prácu.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">5</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Možnosť zľavy pre stálu klientelu</h3>
                  <p className="mt-1 text-gray-600">
                    Mnohí majstri si budujú stabilnú klientelu aj tým, že ponúkajú zľavu pri opakovanej spolupráci.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-6">
              Máte ďalšie otázky ohľadom cenotvorby? Neváhajte nás kontaktovať.
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

export default Pricing;
