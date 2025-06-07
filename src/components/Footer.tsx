import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
const Footer = () => {
  return <footer className="bg-secondary py-12 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-semibold tracking-tight">
              Majstri<span className="text-gray-950">.com</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Prepájame profesionálnych remeselníkov a zákazníkov po celom Slovensku.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Pre remeselníkov</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/register" className="hover:text-foreground transition-colors">
                  Registrácia
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Prihlásenie
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  Cenník služieb
                </Link>
              </li>
              <li>
                <Link to="/benefits" className="hover:text-foreground transition-colors">
                  Výhody registrácie
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Pre zákazníkov</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/craftsmen" className="hover:text-foreground transition-colors">
                  Vyhľadať remeselníkov
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-foreground transition-colors">
                  Kategórie služieb
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">
                  Ako to funguje
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-foreground transition-colors">
                  Hodnotenia a recenzie
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Spoločnosť</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  O nás
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Ochrana súkromia
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Podmienky používania
                </Link>
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
    </footer>;
};
export default Footer;