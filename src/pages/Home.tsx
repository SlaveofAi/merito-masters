
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Vitajte na Majstri.com
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Spojte sa s kvalifikovanými remeselníkmi vo vašej oblasti
          </p>
          <div className="space-x-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Začať
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Prihlásiť sa
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
