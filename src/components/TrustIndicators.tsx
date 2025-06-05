
import React from 'react';
import { Shield, Users, Award, Star, CheckCircle, Clock } from 'lucide-react';

export function TrustIndicators() {
  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Overených remeselníkov',
      color: 'text-primary',
    },
    {
      icon: Star,
      value: '4.8',
      label: 'Priemerné hodnotenie',
      color: 'text-yellow-500',
    },
    {
      icon: CheckCircle,
      value: '2000+',
      label: 'Úspešných projektov',
      color: 'text-success-500',
    },
    {
      icon: Clock,
      value: '24h',
      label: 'Priemerná odozva',
      color: 'text-accent-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="text-center group hover:scale-105 transition-transform duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={cn(
            'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br from-white to-gray-50 shadow-soft group-hover:shadow-medium transition-shadow'
          )}>
            <stat.icon className={cn('h-6 w-6', stat.color)} />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
