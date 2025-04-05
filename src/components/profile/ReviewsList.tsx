
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReviewCard from "./ReviewCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ReviewsListProps {
  reviews: any[];
  isLoading: boolean;
  canReplyToReview: boolean;
  userId?: string;
  onRefresh: () => void;
  error?: any;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  isLoading,
  canReplyToReview,
  userId,
  onRefresh,
  error
}) => {
  // For debugging
  console.log("ReviewsList rendering", {
    reviewsCount: reviews?.length,
    isLoading,
    canReply: canReplyToReview,
    userId
  });

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>
          {typeof error === 'string' 
            ? error 
            : 'Nastala chyba pri načítaní hodnotení. Skúste obnoviť stránku.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-sm text-gray-500">Načítavam hodnotenia...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            Zatiaľ nie sú žiadne hodnotenia. Buďte prvý, kto ohodnotí tohto remeselníka.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard 
          key={review.id}
          review={review}
          canReplyToReview={canReplyToReview}
          userId={userId}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
