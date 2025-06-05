
import React from "react";
import Layout from "@/components/Layout";
import { Search, MessageSquare, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Vyhľadajte remeselníka",
      description: "Zadajte typ služby a vašu lokalitu. Nájdite si remeselníka s najlepším hodnotením."
    },
    {
      icon: MessageSquare,
      title: "Kontaktujte a dohodnite sa",
      description: "Pošlite správu alebo zavolajte priamo remeselníkovi. Dohodnite si termín a cenu."
    },
    {
      icon: CheckCircle,
      title: "Dokončite projekt",
      description: "Po dokončení práce môžete zanechať hodnotenie a pomôcť tak ostatným zákazníkom."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Ako to funguje</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Pre remeselníkov</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>1. Registrácia:</strong> Vytvorte si profil a prezentujte svoje služby.
              </p>
              <p>
                <strong>2. Portfólio:</strong> Pridajte fotografie svojich prác a získajte dôveru zákazníkov.
              </p>
              <p>
                <strong>3. Komunikácia:</strong> Odpovedajte na požiadavky zákazníkov a získavajte nové zákazky.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
