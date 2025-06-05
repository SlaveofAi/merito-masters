
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Star, MessageSquare, Flag, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  customer_name: string;
  craftsman_id: string;
  craftsman_name?: string;
  rating: number;
  comment: string;
  created_at: string;
  flagged?: boolean;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch reviews with craftsman information
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('craftsman_reviews')
        .select(`
          *,
          craftsman_profiles(name)
        `)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Transform the data to include craftsman names
      const transformedReviews = reviewsData?.map(review => ({
        ...review,
        craftsman_name: review.craftsman_profiles?.name || 'Unknown Craftsman',
        flagged: review.rating <= 2 // Simple flagging logic for low ratings
      })) || [];

      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    try {
      // First delete any replies to this review
      const { error: repliesError } = await supabase
        .from('craftsman_review_replies')
        .delete()
        .eq('review_id', reviewId);

      if (repliesError) throw repliesError;

      // Then delete the review
      const { error: reviewError } = await supabase
        .from('craftsman_reviews')
        .delete()
        .eq('id', reviewId);

      if (reviewError) throw reviewError;

      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleViewCraftsman = (craftsmanId: string) => {
    window.open(`/profile/${craftsmanId}`, '_blank');
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.craftsman_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="mt-2 text-sm text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor and moderate customer reviews and ratings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{getAverageRating()}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.flagged).length}
                </p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">5-Star Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.rating === 5).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
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

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
          <CardDescription>
            Manage and moderate all reviews on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Craftsman</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.customer_name}</TableCell>
                  <TableCell>{review.craftsman_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate">{review.comment || 'No comment'}</p>
                  </TableCell>
                  <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {review.flagged && (
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                    {!review.flagged && (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCraftsman(review.craftsman_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reviews found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reviews;
