
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CraftsmanReviewWithCraftsman } from "./types";

interface ReviewListProps {
  reviews: CraftsmanReviewWithCraftsman[];
  isCurrentUser: boolean;
  onEditClick: (review: CraftsmanReviewWithCraftsman) => void;
  editingReview: CraftsmanReviewWithCraftsman | null;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  isCurrentUser,
  onEditClick,
  editingReview
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            {isCurrentUser 
              ? "Zatiaľ ste nenapísali žiadne hodnotenia."
              : "Tento používateľ zatiaľ nenapísal žiadne hodnotenia."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex items-start space-x-3">
                <Link to={`/profile/${review.craftsman?.id}/portfolio`}>
                  <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    {review.craftsman?.profile_image_url ? (
                      <AvatarImage 
                        src={review.craftsman.profile_image_url} 
                        alt={review.craftsman?.name || 'Remeselník'} 
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-200">
                        <User className="text-gray-500" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                <div>
                  <Link 
                    to={`/profile/${review.craftsman?.id}/portfolio`}
                    className="font-medium hover:text-primary hover:underline transition-colors"
                  >
                    {review.craftsman?.name || 'Neznámy remeselník'}
                  </Link>
                  {review.craftsman?.trade_category && (
                    <Badge variant="outline" className="mt-1">
                      {review.craftsman.trade_category}
                    </Badge>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(review.created_at).toLocaleString("sk-SK", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating 
                        ? "text-yellow-500 fill-current" 
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mt-4 break-words whitespace-normal">{review.comment || "Bez komentára"}</p>
            
            {/* Edit button - only show for the current user's reviews */}
            {isCurrentUser && !editingReview && (
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditClick(review)}
                  className="flex items-center text-sm text-gray-500 hover:text-primary"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Upraviť
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewList;
