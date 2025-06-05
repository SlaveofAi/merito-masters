
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MessageSquare, Flag } from "lucide-react";

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  // Mock data for reviews
  const reviews = [
    {
      id: '1',
      customer: 'John Doe',
      craftsman: 'Peter Novák',
      rating: 5,
      comment: 'Excellent work, very professional!',
      createdAt: '2025-06-01',
      flagged: false
    },
    {
      id: '2',
      customer: 'Jane Smith',
      craftsman: 'Miroslav Kováč',
      rating: 2,
      comment: 'Work was not completed as expected...',
      createdAt: '2025-05-28',
      flagged: true
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor and moderate customer reviews and ratings.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRating === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterRating('all')}
              >
                All Ratings
              </Button>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={filterRating === rating.toString() ? 'default' : 'outline'}
                  onClick={() => setFilterRating(rating.toString() as any)}
                >
                  {rating}★
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                    {review.flagged && (
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 mt-2">{review.comment}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <span>Customer: {review.customer}</span>
                    <span>Craftsman: {review.craftsman}</span>
                    <span>{review.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {review.flagged && (
                    <Button variant="outline" size="sm">
                      Moderate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
