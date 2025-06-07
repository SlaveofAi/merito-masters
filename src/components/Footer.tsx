
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  const handleLinkClick = (to: string) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-secondary py-12 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <button 
              onClick={() => handleLinkClick("/")}
              className="text-2xl font-semibold tracking-tight text-left hover:opacity-80 transition-opacity"
            >
              Majstri<span className="text-gray-950">.com</span>
            </button>
            <p className="text-sm text-muted-foreground max-w-xs">
              Prepájame profesionálnych remeselníkov a zákazníkov po celom Slovensku.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Pre remeselníkov</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button 
                  onClick={() => handleLinkClick("/register")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Registrácia
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/login")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Prihlásenie
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/pricing")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Cenník služieb
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/benefits")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Výhody registrácie
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Pre zákazníkov</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button 
                  onClick={() => handleLinkClick("/home")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Vyhľadať remeselníkov
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/categories")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Kategórie služieb
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/how-it-works")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Ako to funguje
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/reviews")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Hodnotenia a recenzie
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Spoločnosť</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button 
                  onClick={() => handleLinkClick("/about")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  O nás
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/contact")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Kontakt
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/privacy")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Ochrana súkromia
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick("/terms")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Podmienky používania
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Majstri.com. Všetky práva vyhradené.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="https://www.facebook.com/share/1CDQNNz1iE/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
              <Facebook size={22} />
            </a>
            <a href="https://www.instagram.com/majstri2025?igsh=dzJjN29rMjR5YmJ3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
              <Instagram size={22} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
