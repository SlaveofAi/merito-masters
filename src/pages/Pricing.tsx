
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
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("pricing_title")}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {t("pricing_subtitle")}
            </p>
          </div>

          <Card className="mb-12 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center mb-2">
                <div className="bg-primary/5 rounded-full p-2 mr-3">
                  <EuroIcon className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">{t("platform_pricing_policy")}</CardTitle>
              </div>
              <CardDescription className="text-lg text-gray-700">
                {t("platform_pricing_desc_1")} <strong>{t("platform_pricing_desc_2")}</strong>. {t("platform_pricing_desc_3")} <strong>{t("platform_pricing_desc_4")}</strong> {t("platform_pricing_desc_5")}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("set_effective_pricing")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("recommendations")}
            </p>

            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("consider_costs")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("consider_costs_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("analyze_competition")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("analyze_competition_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("be_transparent")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("be_transparent_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("specify_what_included")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("specify_what_included_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <span className="font-bold">5</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("regular_discounts")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("regular_discounts_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-6">
              {t("more_pricing_questions")}
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              {t("contact_us")}
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
