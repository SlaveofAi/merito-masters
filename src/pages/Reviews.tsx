
import React from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { StarIcon, MessageSquareText, AlertTriangle, CheckCircle } from "lucide-react";

const Reviews: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              ⭐ Hodnotenia a recenzie
            </h1>
          </div>

          <Card className="mb-10 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Prečo sú recenzie dôležité?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-4">
                Recenzie a hodnotenia sú <strong>kľúčovým prvkom dôvery</strong> medzi zákazníkmi a remeselníkmi. 
                Pomáhajú novým zákazníkom rozhodnúť sa, komu zveria svoju zákazku, a remeselníkom dávajú 
                spätnú väzbu, ktorú môžu využiť na zlepšenie služieb.
              </p>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-10 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Pravidlá férového hodnotenia:
            </h2>

            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Recenzie musia byť pravdivé a vecné</h3>
                  <p className="mt-1 text-gray-600">
                    Hodnoť len na základe vlastnej skúsenosti. Vyhýbaj sa urážkam, osobným útokom či nepravdivým tvrdeniam.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Nie je dovolené písať falošné recenzie</h3>
                  <p className="mt-1 text-gray-600">
                    Falošné pozitívne recenzie od známych alebo negatívne hodnotenia od konkurencie sú zakázané a budú odstránené.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Možnosť odpovede pre remeselníka</h3>
                  <p className="mt-1 text-gray-600">
                    Každý majster má možnosť reagovať na hodnotenie – vysvetliť situáciu alebo sa ospravedlniť v prípade nedorozumenia.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <StarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">Moderovanie recenzií</h3>
                  <p className="mt-1 text-gray-600">
                    Recenzie nepreverujeme automaticky, ale v prípade nahlásenia nevhodného obsahu môžeme recenziu prehodnotiť alebo odstrániť.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="mb-10 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Ako funguje hodnotenie?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Hodnotiť môže len zákazník, ktorý má <strong>overenú rezerváciu</strong> alebo <strong>preukázateľnú komunikáciu s majstrom</strong>.</li>
                <li>Hodnotenie obsahuje <strong>počet hviezdičiek (1–5)</strong> a voliteľný <strong>textový komentár</strong>.</li>
              </ul>
              
              <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-blue-700 italic">
                  <span className="font-semibold">💡</span> Váš názor pomáha vytvárať lepšiu komunitu. Vážime si každé hodnotenie, ktoré pomáha ostatným zákazníkom aj remeselníkom rásť.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reviews;
