
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function SocialProof() {
  const testimonials = [
    {
      name: 'Mária Novotná',
      role: 'Domáca majsterka',
      content: 'Našla som skvelého elektrikára za pár minút. Profesionálny prístup a férová cena.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Peter Kováč',
      role: 'Podnikateľ',
      content: 'Renovoval som celý byt cez túto platformu. Všetci remeselníci boli spoľahliví.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Anna Svobodová',
      role: 'Architektka',
      content: 'Odporúčam všetkým. Konečne miesto, kde nájdete kvalitných remeselníkov.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    },
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-primary-50/50 to-accent-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold font-heading text-gradient mb-4">
            Čo hovoria naši zákazníci
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tisíce spokojných zákazníkov už našlo svojho ideálnego remeselníka
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="card-enhanced hover-lift group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary/20 mb-2" />
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-soft"
                    />
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
            <span className="text-sm font-medium">100% overení remeselníci</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm font-medium">Bezplatná registrácia</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
            <span className="text-sm font-medium">24/7 podpora</span>
          </div>
        </div>
      </div>
    </div>
  );
}
