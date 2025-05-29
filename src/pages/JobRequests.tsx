
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Calendar, Plus, Eye, MessageSquare, ZoomIn, User } from "lucide-react";
import { craftCategories } from "@/constants/categories";
import { toast } from "sonner";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import ImageModal from "@/components/ImageModal";

interface JobRequest {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  job_category: string;
  custom_category: string | null;
  location: string;
  description: string;
  preferred_date: string | null;
  urgency: string;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
}

const JobRequests = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const { data: jobRequests, isLoading } = useQuery({
    queryKey: ['job-requests', categoryFilter, locationFilter, urgencyFilter],
    queryFn: async () => {
      let query = supabase
        .from('job_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq('job_category', categoryFilter);
      }

      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      if (urgencyFilter !== "all") {
        query = query.eq('urgency', urgencyFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleResponse = async (jobId: string, customerId: string, jobRequest: JobRequest) => {
    if (!user || userType !== 'craftsman') {
      toast.error("Len remeselníci môžu odpovedať na požiadavky");
      return;
    }

    try {
      // Get craftsman profile for name
      const { data: profile } = await supabase
        .from('craftsman_profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (!profile) {
        toast.error("Profil remeselníka nebol nájdený");
        return;
      }

      // Create job response
      const { error } = await supabase
        .from('job_responses')
        .insert({
          job_request_id: jobId,
          craftsman_id: user.id,
          craftsman_name: profile.name,
          message: "Mám záujem o túto prácu. Kontaktujte ma pre viac informácií."
        });

      if (error) {
        console.error("Error creating response:", error);
        toast.error("Chyba pri odosielaní odpovede");
        return;
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('customer_id', customerId)
        .eq('craftsman_id', user.id)
        .single();

      let conversationId = existingConversation?.id;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        const { data: newConversation, error: conversationError } = await supabase
          .from('chat_conversations')
          .insert({
            customer_id: customerId,
            craftsman_id: user.id
          })
          .select('id')
          .single();

        if (conversationError) {
          console.error("Error creating conversation:", conversationError);
          toast.error("Chyba pri vytváraní konverzácie");
          return;
        }

        conversationId = newConversation.id;
      }

      // Send an initial message with job request context
      const jobCategory = getCategoryDisplay(jobRequest);
      const contextMessage = `Mám záujem o vašu požiadavku: "${jobCategory}" v lokalite ${jobRequest.location}. ${jobRequest.description.substring(0, 100)}${jobRequest.description.length > 100 ? '...' : ''}`;

      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: customerId,
          content: contextMessage,
          metadata: {
            type: 'job_response',
            job_request_id: jobId,
            job_category: jobCategory,
            job_location: jobRequest.location
          }
        });

      if (messageError) {
        console.error("Error sending initial message:", messageError);
      }

      toast.success("Odpoveď bola úspešne odoslaná");
      
      // Redirect to messages with the conversation
      navigate("/messages", {
        state: {
          from: 'job-response',
          conversationId: conversationId,
          contactId: customerId,
          jobRequestContext: {
            id: jobId,
            category: jobCategory,
            location: jobRequest.location,
            description: jobRequest.description
          }
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Nastala neočakávaná chyba");
    }
  };

  const getCategoryDisplay = (job: JobRequest) => {
    if (job.custom_category && job.job_category === "Iné") {
      return job.custom_category;
    }
    return job.job_category;
  };

  const handleImageClick = (imageUrl: string) => {
    console.log('Image clicked in JobRequests:', imageUrl);
    setSelectedImageUrl(imageUrl);
  };

  const handleMyRequestsClick = () => {
    // Navigate to the customer profile page which shows job requests
    navigate("/profile");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Požiadavky zákazníkov</h1>
            <p className="text-muted-foreground mt-2">
              Nájdite prácu, ktorá vám vyhovuje
            </p>
          </div>
          
          <div className="flex gap-2">
            {user && userType === 'customer' && (
              <>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleMyRequestsClick}
                >
                  <User className="h-4 w-4" />
                  Moje požiadavky
                </Button>
                <Link to="/post-job">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Pridať požiadavku
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Kategória" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky kategórie</SelectItem>
              {craftCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="Iné">Iné</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filtrovať podľa lokality..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Naliehavosť" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky</SelectItem>
              <SelectItem value="asap">Čo najskôr</SelectItem>
              <SelectItem value="flexible">Flexibilné</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setCategoryFilter("all");
              setLocationFilter("");
              setUrgencyFilter("all");
            }}
          >
            Vymazať filtre
          </Button>
        </div>

        {/* Job Requests List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobRequests && jobRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobRequests.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{getCategoryDisplay(job)}</CardTitle>
                    <Badge variant={job.urgency === 'asap' ? 'destructive' : 'secondary'}>
                      {job.urgency === 'asap' ? 'Naliehavé' : 'Flexibilné'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                </CardHeader>
                <CardContent>
                  {(job.image_urls && job.image_urls.length > 0) || job.image_url ? (
                    <div className="mb-4">
                      {job.image_urls && job.image_urls.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {job.image_urls.slice(0, 4).map((url, index) => (
                            <div 
                              key={index} 
                              className="relative group cursor-pointer"
                              onClick={() => handleImageClick(url)}
                            >
                              <img 
                                src={url} 
                                alt={`Job request ${index + 1}`} 
                                className="w-full h-20 object-cover rounded"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <ZoomIn className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          ))}
                          {job.image_urls.length > 4 && (
                            <div className="flex items-center justify-center bg-gray-100 rounded text-sm text-gray-600">
                              +{job.image_urls.length - 4} ďalších
                            </div>
                          )}
                        </div>
                      ) : job.image_url && (
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(job.image_url!)}
                        >
                          <img 
                            src={job.image_url} 
                            alt="Job request" 
                            className="w-full h-32 object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                  
                  <p className="text-sm mb-4 line-clamp-3">{job.description}</p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {job.preferred_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Preferovaný dátum: {format(new Date(job.preferred_date), 'dd.MM.yyyy', { locale: sk })}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Pridané: {format(new Date(job.created_at), 'dd.MM.yyyy', { locale: sk })}
                    </div>
                  </div>

                  {user && userType === 'craftsman' && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm">
                        <strong>Kontakt:</strong> {job.customer_name}
                        <br />
                        <strong>Email:</strong> {job.customer_email}
                        {job.customer_phone && (
                          <>
                            <br />
                            <strong>Telefón:</strong> {job.customer_phone}
                          </>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleResponse(job.id, job.customer_id, job)}
                        className="w-full"
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Odpovedať
                      </Button>
                    </div>
                  )}

                  {!user && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Prihláste sa ako remeselník pre zobrazenie kontaktných údajov
                      </p>
                      <Link to="/login">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Prihlásiť sa
                        </Button>
                      </Link>
                    </div>
                  )}

                  {user && userType === 'customer' && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Len remeselníci môžu odpovedať na požiadavky
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Žiadne požiadavky</h3>
            <p className="text-muted-foreground">
              Momentálne nie sú k dispozícii žiadne otvorené požiadavky.
            </p>
          </div>
        )}

        {/* Image Modal for zooming */}
        {selectedImageUrl && (
          <ImageModal
            imageUrl={selectedImageUrl}
            onClose={() => setSelectedImageUrl(null)}
            alt="Job request image"
          />
        )}
      </div>
    </Layout>
  );
};

export default JobRequests;
