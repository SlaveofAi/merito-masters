
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);

  const handleUserTypeSelection = (type: string) => {
    setUserType(type);
    
    // Store the user type in session storage to use in registration
    sessionStorage.setItem("userType", type);
    
    // Navigate to registration
    navigate("/register");
    
    toast.success(`Welcome! Please register as a ${type === 'craftsman' ? 'Craftsman' : 'Customer'}`, {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white py-6 px-4 sm:px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Majstri.sk</div>
          <Link to="/login" className="text-sm font-medium hover:underline">
            Log in
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Majstri.sk</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The platform connecting skilled craftsmen with customers needing professional services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
          <div 
            className={`relative cursor-pointer group overflow-hidden rounded-lg border-2 transition-all h-80 
              ${userType === 'craftsman' ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
            onClick={() => handleUserTypeSelection('craftsman')}
          >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" 
              alt="Craftsman" 
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6">
              <h2 className="text-3xl font-bold text-white mb-3">I am a Craftsman</h2>
              <p className="text-white/90 text-center mb-6">
                Showcase your skills and find new clients in your area
              </p>
              <Button variant="outline" className="bg-white/90 hover:bg-white">
                Get Started
              </Button>
            </div>
          </div>

          <div 
            className={`relative cursor-pointer group overflow-hidden rounded-lg border-2 transition-all h-80
              ${userType === 'customer' ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
            onClick={() => handleUserTypeSelection('customer')}
          >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1721322800607-8c38375eef04" 
              alt="Customer" 
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6">
              <h2 className="text-3xl font-bold text-white mb-3">I am a Customer</h2>
              <p className="text-white/90 text-center mb-6">
                Find reliable craftsmen for your projects and home improvements
              </p>
              <Button variant="outline" className="bg-white/90 hover:bg-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-secondary py-6 px-4 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} Majstri.sk - Connecting craftsmen and customers</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
