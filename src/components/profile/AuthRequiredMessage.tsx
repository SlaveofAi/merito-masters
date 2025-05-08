
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const AuthRequiredMessage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-3">Prístup obmedzený</h1>
        
        <p className="text-gray-600 mb-6">
          Pre prístup k stránkam Majstri.com sa musíte najprv zaregistrovať alebo prihlásiť.
        </p>
        
        <Button 
          onClick={() => navigate("/")} 
          className="w-full"
          size="lg"
        >
          Späť na hlavnú stránku
        </Button>
      </div>
    </div>
  );
};

export default AuthRequiredMessage;
