
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryCount {
  trade_category: string;
  count: number;
}

const Categories = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userLocation, setUserLocation] = useState<string>("");

  // Fetch location from browser if available
  useEffect(() => {
    // Try to get location from localStorage first
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setUserLocation(savedLocation);
    }
  }, []);

  // Fetch all categories with count of craftsmen in each
  const { data: categories, isLoading } = useQuery({
    queryKey: ["craftsman-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("craftsman_profiles")
        .select("trade_category")
        .not("trade_category", "is", null);

      if (error) {
        console.error("Error fetching categories:", error);
        throw new Error(error.message);
      }

      // Count craftsmen in each category
      const categoryCounts: Record<string, number> = {};
      data.forEach(craftsman => {
        if (craftsman.trade_category) {
          categoryCounts[craftsman.trade_category] = 
            (categoryCounts[craftsman.trade_category] || 0) + 1;
        }
      });

      // Convert to array for easier rendering
      return Object.entries(categoryCounts).map(([trade_category, count]) => ({
        trade_category,
        count
      }));
    }
  });

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    // Navigate to home page with category filter
    navigate("/home", { 
      state: { 
        categoryFilter: category,
        userLocation: userLocation 
      } 
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Kategórie remeselníkov</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.sort((a, b) => b.count - a.count).map((category) => (
              <Card 
                key={category.trade_category} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCategoryClick(category.trade_category)}
              >
                <CardContent className={`flex items-center justify-between ${isMobile ? 'p-4' : 'p-6'}`}>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{category.trade_category}</h3>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{category.count} remeselníkov</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary font-semibold rounded-full px-3 py-1 text-sm">
                    {category.count}+
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground mb-4">
                Nenašli sa žiadne kategórie remeselníkov.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Categories;
