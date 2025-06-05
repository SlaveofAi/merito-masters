import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Phone, ArrowRight, Crown, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CraftsmanCardProps {
  id: string;
  name: string;
  profession: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  imageUrl: string;
  customSpecialization?: string | null;
  isTopped?: boolean;
}

const CraftsmanCard: React.FC<CraftsmanCardProps> = ({
  id,
  name,
  profession,
  location,
  rating: initialRating,
  reviewCount: initialReviewCount,
  imageUrl,
  customSpecialization,
  isTopped = false,
}) => {
  // Fetch real reviews data for this craftsman
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('craftsman_reviews')
        .select('*')
        .eq('craftsman_id', id);
      
      if (error) {
        console.error("Error fetching reviews:", error);
        return null;
      }
      
      return data;
    },
  });

  // Calculate the average rating from reviews
  const calculateRating = () => {
    if (!reviewsData || reviewsData.length === 0) {
      return initialRating || 0;
    }
    
    const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((total / reviewsData.length).toFixed(1));
  };

  const rating = calculateRating();
  const reviewCount = reviewsData?.length || initialReviewCount || 0;

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-500 hover-lift cursor-pointer
        ${isTopped 
          ? 'border-2 border-yellow-400/60 shadow-strong shadow-yellow-100/50 ring-1 ring-yellow-400/20 hover:ring-2 hover:ring-yellow-400/40' 
          : 'card-enhanced hover:border-primary/30'
        }
      `}
    >
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Category badge with enhanced animations */}
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-primary border-0 shadow-soft font-medium transition-all duration-300 group-hover:bg-white group-hover:scale-105">
            {customSpecialization ? customSpecialization : profession}
          </Badge>
        </div>
        
        {/* Premium badge with enhanced styling */}
        {isTopped && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-soft px-3 py-1 flex items-center gap-1.5 animate-float">
              <Crown className="h-3.5 w-3.5 fill-white" />
              <span className="text-xs font-semibold">PREMIUM</span>
            </Badge>
          </div>
        )}
        
        {/* Verified indicator with pulse animation */}
        <div className="absolute bottom-4 right-4 z-20">
          <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
            <Verified className="h-4 w-4 text-white fill-white" />
          </div>
        </div>

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm hover:bg-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Link to={`/profile/${id}`}>
              <Button
                size="sm"
                className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-200"
              >
                Profil
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-xl font-heading text-foreground group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
            {isTopped && (
              <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500 animate-float" />
            )}
          </div>
          
          {/* Enhanced rating display */}
          <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-lg border border-yellow-200/50 group-hover:shadow-soft transition-all duration-300">
            <Star className={`w-4 h-4 ${rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} transition-all duration-300 group-hover:scale-110`} />
            <span className="text-sm font-semibold text-yellow-700">
              {rating > 0 ? rating.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-yellow-600">
              ({reviewCount})
            </span>
          </div>
        </div>
        
        {/* Enhanced location with better mobile touch */}
        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm font-medium">{location}</span>
        </div>
        
        {/* Enhanced action buttons with better mobile experience */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-lg hover:scale-105 active:scale-95 touch-manipulation"
          >
            <Phone className="w-4 h-4 mr-2" />
            Kontakt
          </Button>
          
          <Link to={`/profile/${id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full btn-primary rounded-lg group/btn hover:scale-105 active:scale-95 transition-all duration-300 touch-manipulation"
            >
              <span>Profil</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CraftsmanCard;
