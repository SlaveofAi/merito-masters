
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReviewCard from "./ReviewCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, checkConnection } from "@/integrations/supabase/client";

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
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // For debugging
  console.log("ReviewsList rendering", {
    reviewsCount: reviews?.length,
    isLoading,
    canReply: canReplyToReview,
    userId,
    connectionStatus
  });

  // Check Supabase connection on component mount
  useEffect(() => {
    const verifyConnection = async () => {
      setCheckingConnection(true);
      try {
        const isConnected = await checkConnection();
        setConnectionStatus(isConnected);
        console.log("Supabase connection status:", isConnected);
      } catch (err) {
        console.error("Error checking Supabase connection:", err);
        setConnectionStatus(false);
      } finally {
        setCheckingConnection(false);
      }
    };

    verifyConnection();
  }, []);

  const handleRetryConnection = async () => {
    setCheckingConnection(true);
    try {
      const isConnected = await checkConnection();
      setConnectionStatus(isConnected);
      
      if (isConnected) {
        // If connection is restored, refresh the data
        onRefresh();
        toast.success("Pripojenie k databáze obnovené");
      }
    } catch (err) {
      console.error("Error retrying connection:", err);
      setConnectionStatus(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  // Display connection status
  if (connectionStatus === false) {
    return (
      <Alert variant="destructive" className="mb-4 bg-red-50">
        <WifiOff className="h-4 w-4 mr-2" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span>Chyba pripojenia k databáze. Skúste stránku obnoviť alebo to skúste neskôr.</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetryConnection}
            disabled={checkingConnection}
            className="ml-2"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${checkingConnection ? 'animate-spin' : ''}`} />
            Skúsiť znova
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

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
      {/* Connection status indicator */}
      {connectionStatus === true && (
        <div className="flex items-center text-sm text-green-600 mb-2">
          <Wifi className="h-4 w-4 mr-1" />
          <span>Pripojenie k databáze je aktívne</span>
        </div>
      )}

      {reviews.map((review) => (
        <ReviewCard 
          key={review.id}
          review={review}
          reply={review.reply}
          isCraftsman={canReplyToReview}
          onReplyUpdated={onRefresh}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
