
import React from "react";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">{t("privacy_policy")}</h1>
        <p className="text-muted-foreground text-center mb-8">
          {t("last_updated")}: 4. {t("may")} 2025
        </p>
        
        <div className="prose max-w-none">
          <p className="mb-6 text-muted-foreground">
            {t("privacy_intro")}
          </p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. {t("who_processes_data")}</h2>
            <p className="text-muted-foreground">
              {t("data_controller_desc")}: <a href="mailto:dvidid35@gmail.com" className="text-primary hover:underline">dvidid35@gmail.com</a>
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. {t("what_data_processed")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("registration_data_desc")}:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>{t("full_name")}</li>
              <li>{t("email_address")}</li>
              <li>{t("phone_number")}</li>
              <li>{t("city_of_residence")}</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              {t("data_purpose_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. {t("data_purpose")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("data_processing_purposes")}:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>{t("registration_account")}</li>
              <li>{t("profile_creation")}</li>
              <li>{t("contact_facilitation")}</li>
              <li>{t("system_messages")}</li>
              <li>{t("platform_updates")}</li>
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. {t("data_access")}</h2>
            <p className="text-muted-foreground">
              {t("data_access_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. {t("data_retention")}</h2>
            <p className="text-muted-foreground">
              {t("data_retention_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. {t("cookies_usage")}</h2>
            <p className="text-muted-foreground">
              {t("cookies_usage_desc")}
            </p>
          </section>
          
          <Separator className="my-6" />
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. {t("data_transfer")}</h2>
            <p className="text-muted-foreground">
              {t("data_transfer_desc")}
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
