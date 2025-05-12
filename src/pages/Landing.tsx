
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";

const Landing = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const { user, loading } = useAuth();
  
  // Redirect authenticated users to home page
  useEffect(() => {
    // Log state for debugging
    console.log("Landing page - Auth state:", { 
      isLoggedIn: !!user, 
      isLoading: loading,
      currentPath: window.location.pathname
    });

    if (!loading && user) {
      console.log("User is authenticated, redirecting to home page");
      navigate("/home", { replace: true });
    }
  }, [user, navigate, loading]);

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

  // If we're still checking auth state, show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Majstri.com - Spojenie remeselníkov a zákazníkov</title>
        <meta name="description" content="Majstri.com - Platforma spájajúca profesionálnych remeselníkov s ľuďmi, ktorí hľadajú ich služby. Nájdite overených odborníkov na váš projekt." />
      </Helmet>
      
      <header className="py-6 px-4 sm:px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-black">Majstri.com</div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:underline">
              Prihlásenie
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Vitajte na Majstri.com</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Platforma spájajúca profesionálnych remeselníkov s ľuďmi, ktorí hľadajú ich služby
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
          <div 
            className={`relative cursor-pointer group overflow-hidden rounded-lg border-2 transition-all h-80 
              ${userType === 'craftsman' ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
            onClick={() => handleUserTypeSelection('craftsman')}
          >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" 
              alt="Craftsman" 
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6">
              <h2 className="text-3xl font-bold text-white mb-3">Som remeselník</h2>
              <p className="text-white/90 text-center mb-6">
                Prezentujte svoje zručnosti a nájdite nových klientov vo vašom okolí
              </p>
              <Button variant="outline" className="bg-white/90 hover:bg-white text-black">
                Začať
              </Button>
            </div>
          </div>

          <div 
            className={`relative cursor-pointer group overflow-hidden rounded-lg border-2 transition-all h-80
              ${userType === 'customer' ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
            onClick={() => handleUserTypeSelection('customer')}
          >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1721322800607-8c38375eef04" 
              alt="Customer" 
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6">
              <h2 className="text-3xl font-bold text-white mb-3">Som zákazník</h2>
              <p className="text-white/90 text-center mb-6">
                Nájdite spoľahlivých remeselníkov pre vaše projekty a vylepšenia domácnosti
              </p>
              <Button variant="outline" className="bg-white/90 hover:bg-white text-black">
                Začať
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
