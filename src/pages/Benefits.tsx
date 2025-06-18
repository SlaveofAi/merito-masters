import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Shield, Zap } from "lucide-react";
const Benefits: React.FC = () => {
  const benefits = [{
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Bezplatná registrácia",
    description: "Zaregistrujte sa úplne zadarmo a začnite získavať zákazníkov okamžite."
  }, {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Priamy kontakt so zákazníkmi",
    description: "Komunikujte priamo so zákazníkmi cez náš chat systém."
  }, {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Budovanie reputácie",
    description: "Získavajte hodnotenia a recenzie od spokojných zákazníkov."
  }, {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: "Portfólio prác",
    description: "Ukážte svoju prácu pomocou fotografií vašich projektov."
  }];
  return <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Výhody registrácie </h1>
            <p className="text-lg text-gray-600">
              Prečo sa registrovať na Majstri.com?
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit, index) => <Card key={index} className="bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {benefit.icon}
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </Layout>;
};
export default Benefits;