
import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ArrowRight, Crown } from "lucide-react";
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
      className={`overflow-hidden transition-all duration-300 group hover:shadow-md 
        ${isTopped 
          ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-100' 
          : 'border-border/50 shadow-sm'
        }
      `}
    >
      <div className="relative h-60 overflow-hidden">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10"></div>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full z-20">
          {customSpecialization ? customSpecialization : profession}
        </div>
        {isTopped && (
          <div className="absolute top-4 right-4 z-20">
            <Badge variant="outline" className="bg-yellow-500/90 backdrop-blur-sm text-white border-yellow-400 px-2 py-0.5 flex items-center gap-1">
              <Crown className="h-3 w-3 fill-white" />
              <span className="text-xs">PREMIUM</span>
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            {isTopped && (
              <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <div className="flex items-center">
            <Star className={`w-4 h-4 ${rating > 0 ? 'fill-current text-yellow-500' : 'text-gray-300'} mr-1`} />
            <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({reviewCount})
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span>{location}</span>
        </div>
        <div className="flex justify-end items-center">
          <Link to={`/craftsman/${id}`} className="group/link">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs rounded-full px-3 group-hover/link:translate-x-1 transition-transform"
            >
              <span>Profil</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CraftsmanCard;
