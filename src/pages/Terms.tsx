
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">{t("terms_of_service")}</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. {t("basic_information")}</h2>
            <p className="text-muted-foreground">
              {t("terms_intro")} <a href="mailto:dvidid35@gmail.com" className="text-primary hover:underline">dvidid35@gmail.com</a>.
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. {t("registration_age")}</h2>
            <p className="text-muted-foreground">
              {t("registration_age_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. {t("user_types")}</h2>
            <p className="text-muted-foreground">
              {t("platform_user_types")}:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li><strong>{t("craftsman")}</strong>: {t("craftsman_desc")},</li>
              <li><strong>{t("customer")}</strong>: {t("customer_desc")}.</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. {t("user_content")}</h2>
            <p className="text-muted-foreground">
              {t("user_content_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. {t("ratings_reviews")}</h2>
            <p className="text-muted-foreground">
              {t("ratings_reviews_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. {t("bookings_communication")}</h2>
            <p className="text-muted-foreground">
              {t("bookings_communication_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. {t("responsibility")}</h2>
            <p className="text-muted-foreground">
              {t("responsibility_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. {t("payments")}</h2>
            <p className="text-muted-foreground">
              {t("payments_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. {t("account_restrictions")}</h2>
            <p className="text-muted-foreground">
              {t("account_restrictions_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. {t("promotion_outside")}</h2>
            <p className="text-muted-foreground">
              {t("promotion_outside_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. {t("data_protection")}</h2>
            <p className="text-muted-foreground">
              {t("data_protection_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. {t("analytics_cookies")}</h2>
            <p className="text-muted-foreground">
              {t("analytics_cookies_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. {t("final_provisions")}</h2>
            <p className="text-muted-foreground">
              {t("final_provisions_desc")}
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
