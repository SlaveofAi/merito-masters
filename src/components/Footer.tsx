
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Majstri.com</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Prepájame profesionálnych remeselníkov a zákazníkov po celom Slovensku.
            </p>
          </div>

          {/* For Craftsmen */}
          <div>
            <h4 className="text-base font-medium mb-4">Pre remeselníkov</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Registrácia
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Prihlásenie
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  Cenník služieb
                </Link>
              </li>
              <li>
                <Link to="/benefits" className="text-gray-300 hover:text-white transition-colors">
                  Výhody registrácie
                </Link>
              </li>
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="text-base font-medium mb-4">Pre zákazníkov</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  Vyhľadať remeselníkov
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  Kategórie služieb
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  Ako to funguje
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-gray-300 hover:text-white transition-colors">
                  Hodnotenia a recenzie
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-base font-medium mb-4">Spoločnosť</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  O nás
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Ochrana súkromia
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Podmienky používania
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2025 Majstri.com. Všetky práva vyhradené.
          </p>
          
          {/* Social Links */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
