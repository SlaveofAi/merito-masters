
import React from "react";
import Layout from "@/components/Layout";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("how_it_works_title")}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {t("platform_connecting")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For customers */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">{t("for_customers")}</h2>
              </div>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("choose_category")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("choose_category_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("view_profiles")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("view_profiles_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("contact_craftsman")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("contact_craftsman_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("book_appointment")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("book_appointment_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mr-4">
                    <span className="font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("rate_after_completion")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("rate_after_completion_desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For craftsmen */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">{t("for_craftsmen")}</h2>
              </div>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("register_create_profile")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("register_create_profile_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("set_availability")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("set_availability_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("communicate_with_customers")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("communicate_with_customers_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("gather_reviews")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("gather_reviews_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full text-amber-600 mr-4">
                    <span className="font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("highlight_profile")}</h3>
                    <p className="mt-1 text-gray-600">
                      {t("highlight_profile_desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">
              {t("more_questions")}
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

export default HowItWorks;
