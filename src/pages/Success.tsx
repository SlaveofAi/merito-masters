
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const Success = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Platba úspešná!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">Máte aktívnu top pozíciu!</span>
              </div>
              
              <p className="text-muted-foreground">
                Váš profil sa teraz zobrazuje na prvých miestach po dobu 7 dní. 
                Očakávajte viac zákazníkov!
              </p>
              
              <div className="space-y-2">
                <Link to="/profile">
                  <Button className="w-full">
                    Prejsť na profil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Success;
