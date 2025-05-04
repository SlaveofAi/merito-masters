
import React from "react";
import Layout from "@/components/Layout";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              📬 {t("contact_us")}
            </h1>
          </div>

          <Card className="mb-10 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{t("contact_question")}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-6">
                🧰 {t("contact_feedback")}
              </p>
              
              <div className="bg-primary/5 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <Mail className="h-6 w-6 text-primary mr-3" />
                  <span className="text-lg font-medium">{t("email_us")}:</span>
                </div>
                <a 
                  href="mailto:dvidid35@gmail.com" 
                  className="text-primary hover:underline text-lg font-medium"
                >
                  dvidid35@gmail.com
                </a>
              </div>
              
              <p className="mt-6 text-center text-gray-500 italic">
                {t("reply_soon")}
              </p>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 text-primary mr-3" />
              {t("quick_contact_form")}
            </h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("your_name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder={t("name_placeholder")}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("your_email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("subject")}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder={t("subject_placeholder")}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder={t("message_placeholder")}
                />
              </div>
              
              <div className="text-right">
                <Button type="submit" className="px-8">
                  {t("send_message")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
