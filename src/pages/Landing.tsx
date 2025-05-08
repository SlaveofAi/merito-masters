
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Hero from "@/components/Hero";

const Landing = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);

  const handleUserTypeSelection = (type: string) => {
    setUserType(type);
    
    // Store the user type in session storage to use in registration
    sessionStorage.setItem("userType", type);
    
    // Navigate to registration
    navigate("/register");
    
    toast.success(`Vítajte! Zaregistrujte sa ako ${type === 'craftsman' ? 'Remeselník' : 'Zákazník'}`, {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="py-6 px-4 sm:px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-black">Majstri.com</div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:underline">
              Prihlásenie
            </Link>
            <Button size="sm" onClick={() => navigate("/register")} className="font-medium">
              Registrácia
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Hero />
      </main>

      <footer className="bg-gray-100 py-6 px-4 text-center text-sm text-gray-600">
        <div className="max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} Majstri.com - Spájame remeselníkov a zákazníkov</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
