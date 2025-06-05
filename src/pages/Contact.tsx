import React from "react";
import Layout from "@/components/Layout";
import { Mail, Phone, MapPin } from "lucide-react";
const Contact = () => {
  return <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kontaktujte nás</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <p className="text-lg text-gray-700 mb-6">
              Máte otázku, návrh na zlepšenie alebo ste narazili na problém pri používaní platformy?
            </p>
            <p className="text-gray-600 mb-6">
              Sme otvorení spätnej väzbe, technickým pripomienkam aj podnetom na nové funkcie.
            </p>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Napíšte nám na e-mail:</h2>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <span className="text-lg">info@maj-stri.com</span>
              </div>
            </div>
            <p className="text-gray-600">
              Budeme sa snažiť odpovedať čo najskôr.
            </p>
          </div>
        </div>
      </div>
    </Layout>;
};
export default Contact;