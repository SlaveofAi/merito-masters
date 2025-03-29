
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, ThumbsUp } from "lucide-react";

interface ReviewsTabProps {
  userType: string | null;
  rating: number;
  reviewComment: string;
  handleStarClick: (value: number) => void;
  setReviewComment: (value: string) => void;
  handleSubmitReview: (e: React.FormEvent) => void;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({
  userType,
  rating,
  reviewComment,
  handleStarClick,
  setReviewComment,
  handleSubmitReview
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h3 className="text-xl font-semibold mb-6">Hodnotenia klientov</h3>
        
        <div className="space-y-6">
          {userType === 'craftsman' ? (
            <>
              <Card className="border border-border/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">Tomáš Novák</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 5
                                ? "fill-current text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      18.04.2023
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Výborne spravená práca. Profesionálny prístup, presné dodržanie termínov a výborný výsledok.
                  </p>
                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                      Užitočné
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-border/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">Jana Kováčová</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 5
                                ? "fill-current text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      02.03.2023
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Kvalitný materiál, precízne prevedenie a rýchla práca. Určite odporúčam!
                  </p>
                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                      Užitočné
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p>Tento užívateľ nemá zatiaľ žiadne hodnotenia.</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <Card className="border border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pridať hodnotenie</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vaše hodnotenie
                </label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStarClick(value)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          value <= rating
                            ? "fill-current text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium mb-2"
                >
                  Vaša recenzia
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Popíšte vašu skúsenosť s týmto remeselníkom..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                ></textarea>
              </div>
              <Button type="submit" className="w-full">
                Odoslať hodnotenie
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewsTab;
