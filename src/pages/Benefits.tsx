
import React from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Hammer,
  Users,
  Calendar,
  MessageSquare,
  Star
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Benefits: React.FC = () => {
  const { t, language } = useLanguage();
  
  const craftsBenefits = [
    { 
      title: t("professional_profile"), 
      description: t("professional_profile_desc"),
      icon: <Users className="h-6 w-6 text-primary" />
    },
    { 
      title: t("new_customers"), 
      description: t("new_customers_desc"),
      icon: <Users className="h-6 w-6 text-primary" />
    },
    { 
      title: t("availability_calendar"), 
      description: t("availability_calendar_desc"),
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    { 
      title: t("customer_chat"), 
      description: t("customer_chat_desc"),
      icon: <MessageSquare className="h-6 w-6 text-primary" />
    },
    { 
      title: t("profile_topping"), 
      description: t("profile_topping_desc"),
      icon: <Star className="h-6 w-6 text-primary" />
    },
    { 
      title: t("collecting_reviews"), 
      description: t("collecting_reviews_desc"),
      icon: <Star className="h-6 w-6 text-primary" />
    }
  ];

  const customerBenefits = [
    { 
      title: t("easy_search"), 
      description: t("easy_search_desc"),
      icon: <Hammer className="h-6 w-6 text-primary" />
    },
    { 
      title: t("transparent_profiles"), 
      description: t("transparent_profiles_desc"),
      icon: <Star className="h-6 w-6 text-primary" />
    },
    { 
      title: t("online_booking"), 
      description: t("online_booking_desc"),
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    { 
      title: t("direct_chat"), 
      description: t("direct_chat_desc"),
      icon: <MessageSquare className="h-6 w-6 text-primary" />
    },
    { 
      title: t("booking_history"), 
      description: t("booking_history_desc"),
      icon: <Users className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("registration_benefits")}
            </h1>
          </div>

          {/* Craftsmen Benefits Section */}
          <Card className="mb-10">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center">
                <Hammer className="h-6 w-6 text-primary mr-3" />
                <span>{t("for_craftsmen")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {craftsBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="mr-4 mt-1">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Separator */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-4 text-gray-500 text-sm">{t("and")}</span>
            </div>
          </div>

          {/* Customers Benefits Section */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-primary mr-3" />
                <span>{t("for_customers")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {customerBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="mr-4 mt-1">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Benefits;
