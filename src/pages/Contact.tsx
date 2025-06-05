
import React from "react";
import Layout from "@/components/Layout";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kontakt</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Kontaktné údaje</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary mr-3" />
                    <span>info@majstri.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-3" />
                    <span>+421 900 123 456</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-3" />
                    <span>Bratislava, Slovensko</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Pracovné hodiny</h2>
                <div className="space-y-2 text-gray-600">
                  <p>Pondelok - Piatok: 9:00 - 17:00</p>
                  <p>Sobota: 9:00 - 12:00</p>
                  <p>Nedeľa: Zatvorené</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
