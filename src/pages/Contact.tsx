
import React from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Mail } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              📬 Kontaktujte nás
            </h1>
          </div>

          <Card className="mb-10 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Máte otázku, návrh na zlepšenie alebo ste narazili na problém?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-6">
                🧰 Sme otvorení spätnej väzbe, technickým pripomienkam aj podnetom na nové funkcie.
              </p>
              
              <div className="bg-primary/5 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <Mail className="h-6 w-6 text-primary mr-3" />
                  <span className="text-lg font-medium">Napíšte nám na e-mail:</span>
                </div>
                <a 
                  href="mailto:info@maj-stri.com" 
                  className="text-primary hover:underline text-lg font-medium"
                >
                  info@maj-stri.com
                </a>
              </div>
              
              <p className="mt-6 text-center text-gray-500 italic">
                Budeme sa snažiť odpovedať čo najskôr.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
