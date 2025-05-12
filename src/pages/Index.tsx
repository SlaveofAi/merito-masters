
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedCraftsmen from "@/components/FeaturedCraftsmen";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is logged in when accessing the home page
  useEffect(() => {
    // Log state for debugging
    console.log("Index page - Auth state:", { 
      isLoggedIn: !!user, 
      isLoading: loading, 
    });

    if (!loading && !user) {
      // If not logged in and not loading, redirect to landing page
      console.log("Not authenticated, redirecting to landing page");
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Hero />
      <FeaturedCraftsmen />
    </Layout>
  );
};

export default Index;
