
import React from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Search, MessageCircle, Star, Calendar } from "lucide-react";

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Search className="h-12 w-12 text-primary" />,
      title: "1. Vyhľadajte remeselníka",
      description: "Použite vyhľadávanie podľa profesie alebo lokality na nájdenie vhodného majstra."
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-primary" />,
      title: "2. Kontaktujte ho",
      description: "Napíšte remeselníkovi správu a dohodnite si detaily práce."
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary" />,
      title: "3. Dohodnite termín",
      description: "Rezervujte si vhodný termín pre realizáciu vašej zákazky."
    },
    {
      icon: <Star className="h-12 w-12 text-primary" />,
      title: "4. Ohodnoťte prácu",
      description: "Po dokončení práce zanechajte hodnotenie a pomôžte iným zákazníkom."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Ako to funguje?
            </h1>
            <p className="text-lg text-gray-600">
              Jednoduché kroky k nájdeniu kvalitného remeselníka
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {steps.map((step, index) => (
              <Card key={index} className="bg-white shadow-sm text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {step.icon}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
