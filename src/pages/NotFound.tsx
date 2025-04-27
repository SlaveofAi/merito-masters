
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if this is a profile calendar route that needs to be fixed
  const isProfileCalendarRoute = location.pathname.includes('/profile/') && location.pathname.includes('/contact');

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToCalendar = () => {
    // Replace '/contact' with '/calendar' in the URL
    const newPath = location.pathname.replace('/contact', '/calendar');
    navigate(newPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Stránka nebola nájdená</p>
        
        {isProfileCalendarRoute && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 mb-2">
              Zdá sa, že hľadáte stránku so starým názvom. Sekcia "Kontakt" bola premenovaná na "Kalendár".
            </p>
            <Button 
              onClick={handleGoToCalendar}
              className="w-full mb-2"
            >
              Prejsť na Kalendár
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleGoBack} className="flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Späť
          </Button>
          <Button onClick={handleGoHome} className="flex items-center justify-center gap-2">
            <Home className="h-4 w-4" />
            Domov
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
