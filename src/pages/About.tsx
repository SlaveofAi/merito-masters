
import React from "react";
import Layout from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">O nás</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <p className="text-lg text-gray-700 mb-6">
              Majstri.com je platforma, ktorá spája zákazníkov s overenými remeselníkmi po celom Slovensku.
            </p>
            <p className="text-gray-600 mb-4">
              Našim cieľom je zjednodušiť proces hľadania kvalitných remeselníkov a umožniť im prezentovať svoje služby širokej verejnosti.
            </p>
            <p className="text-gray-600">
              Veríme v kvalitu, spoľahlivosť a transparentnosť vo všetkých našich službách.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
