
import React from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedCraftsmen from "@/components/FeaturedCraftsmen";

const Home = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedCraftsmen />
    </Layout>
  );
};

export default Home;
