
import React from "react";
import Hero from "@/components/Hero";
import FeaturedCraftsmen from "@/components/FeaturedCraftsmen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Search, 
  MessageCircle, 
  CheckCircle, 
  Star, 
  Users, 
  Shield, 
  Clock,
  Hammer,
  Wrench,
  PaintBucket,
  Zap,
  Home as HomeIcon,
  Truck,
  Award,
  TrendingUp,
  MapPin,
  Phone
} from "lucide-react";

const Home = () => {
  const categories = [
    { icon: Hammer, name: "Stavebníctvo", count: "150+ remeselníkov" },
    { icon: Zap, name: "Elektrikári", count: "80+ remeselníkov" },
    { icon: Wrench, name: "Inštalatéri", count: "90+ remeselníkov" },
    { icon: PaintBucket, name: "Maliari", count: "120+ remeselníkov" },
    { icon: HomeIcon, name: "Domáce práce", count: "200+ remeselníkov" },
    { icon: Truck, name: "Preprava", count: "60+ remeselníkov" },
  ];

  const steps = [
    {
      icon: Search,
      title: "Vyhľadajte remeselníka",
      description: "Zadajte typ práce a lokalitu. Nájdite kvalifikovaných remeselníkov vo vašom okolí."
    },
    {
      icon: MessageCircle,
      title: "Komunikujte priamo",
      description: "Kontaktujte remeselníkov cez našu platformu. Diskutujte detaily a ceny."
    },
    {
      icon: CheckCircle,
      title: "Dokončite projekt",
      description: "Dohodnite sa na termíne a nechajte si spraviť kvalitnú prácu."
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Overení remeselníci",
      description: "Všetci remeselníci sú overení a majú hodnotenia od zákazníkov."
    },
    {
      icon: Star,
      title: "Hodnotenia a recenzie",
      description: "Prečítajte si skutočné hodnotenia od predchádzajúcich zákazníkov."
    },
    {
      icon: Clock,
      title: "Rýchle odpovede",
      description: "Väčšina remeselníkov odpovie do 24 hodín."
    }
  ];

  const testimonials = [
    {
      name: "Mária Novákova",
      location: "Bratislava",
      text: "Výborná služba! Našla som kvalitného elektrikára za pár hodín. Odporúčam!",
      rating: 5
    },
    {
      name: "Peter Kováč",
      location: "Košice", 
      text: "Konečne platforma, kde nájdem overených remeselníkov. Úžasné!",
      rating: 5
    },
    {
      name: "Jana Horváthová",
      location: "Žilina",
      text: "Rýchla komunikácia a profesionálny prístup. Veľmi spokojná.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: Award,
      title: "Certifikovaní odborníci",
      description: "Všetci remeselníci prechádzajú procesom overenia kvality a odbornosti."
    },
    {
      icon: MapPin,
      title: "Pokrytie celého Slovenska",
      description: "Nájdite remeselníkov vo všetkých krajoch a mestách Slovenska."
    },
    {
      icon: Phone,
      title: "24/7 zákaznícka podpora",
      description: "Sme tu pre vás kedykoľvek potrebujete pomoc alebo máte otázky."
    }
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Featured Craftsmen */}
      <FeaturedCraftsmen />
      
      {/* How It Works Section */}
      <section className="section-padding bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ako to funguje</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jednoducho nájdite a kontaktujte kvalifikovaných remeselníkov vo vašom okolí
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center border-none shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Populárne kategórie</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nájdite remeselníka pre akýkoľvek typ práce
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category, index) => (
            <Card key={index} className="hover-scale cursor-pointer border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <category.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/categories">
            <Button size="lg" variant="outline">
              Zobraziť všetky kategórie
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Prečo Majstri.com</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dôvody, prečo si vybrať našu platformu pre hľadanie remeselníkov
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center border-none shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Naše výhody</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Čo nás odlišuje od ostatných platforiem
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-none shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Čo hovoria naši zákazníci</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prečítajte si skutočné skúsenosti našich spokojných zákazníkov
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                <CardDescription>{testimonial.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Aktívnych remeselníkov</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">2000+</div>
            <div className="text-muted-foreground">Dokončených projektov</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">4.8</div>
            <div className="text-muted-foreground">Priemerné hodnotenie</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">24h</div>
            <div className="text-muted-foreground">Priemerná doba odpovede</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Pripravení začať?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Pripojte sa k tisíckam spokojných zákazníkov a remeselníkov
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/job-requests">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Nájsť remeselníka
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-primary">
                Registrácia pre remeselníkov
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
