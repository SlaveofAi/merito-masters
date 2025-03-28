
import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CraftsmanCardProps {
  id: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

const CraftsmanCard: React.FC<CraftsmanCardProps> = ({
  id,
  name,
  profession,
  location,
  rating,
  reviewCount,
  imageUrl,
}) => {
  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="relative h-60 overflow-hidden">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10"></div>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full z-20">
          {profession}
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-current text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({reviewCount})
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span>{location}</span>
        </div>
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full px-3"
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Kontakt
          </Button>
          <Link to={`/profile/${id}`} className="group/link">
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
