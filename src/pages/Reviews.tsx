
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
import { useLanguage } from "@/contexts/LanguageContext";

const Reviews: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              ⭐ {t("reviews_ratings")}
            </h1>
          </div>

          <Card className="mb-10 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{t("why_reviews_important")}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-4">
                {t("reviews_importance_1")} <strong>{t("reviews_importance_2")}</strong> {t("reviews_importance_3")}
              </p>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-10 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("fair_review_rules")}
            </h2>

            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("truthful_reviews")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("truthful_reviews_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("fake_reviews_prohibited")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("fake_reviews_prohibited_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("craftsman_response")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("craftsman_response_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary mr-4">
                  <StarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{t("review_moderation")}</h3>
                  <p className="mt-1 text-gray-600">
                    {t("review_moderation_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="mb-10 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{t("how_rating_works")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>{t("rating_rule_1_1")} <strong>{t("rating_rule_1_2")}</strong> {t("rating_rule_1_3")} <strong>{t("rating_rule_1_4")}</strong>.</li>
                <li>{t("rating_rule_2_1")} <strong>{t("rating_rule_2_2")}</strong> {t("rating_rule_2_3")} <strong>{t("rating_rule_2_4")}</strong>.</li>
              </ul>
              
              <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-blue-700 italic">
                  <span className="font-semibold">💡</span> {t("feedback_importance")}
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
