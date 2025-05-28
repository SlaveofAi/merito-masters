import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Edit, Trash2, Eye, MessageSquare, Plus, ZoomIn } from "lucide-react";
import { Link } from "react-router-dom";
import ImageModal from "@/components/ImageModal";

interface JobRequest {
  id: string;
  job_category: string;
  custom_category: string | null;
  location: string;
  description: string;
  preferred_date: string | null;
  urgency: string;
  status: string;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
}

interface JobResponse {
  id: string;
  craftsman_name: string;
  message: string | null;
  created_at: string;
}

const MyJobRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const { data: jobRequests, isLoading } = useQuery({
    queryKey: ['my-job-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('job_requests')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: responses } = useQuery({
    queryKey: ['job-responses', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return [];
      
      const { data, error } = await supabase
        .from('job_responses')
        .select('*')
        .eq('job_request_id', selectedJobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JobResponse[];
    },
    enabled: !!selectedJobId,
  });

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Naozaj chcete vymazať túto požiadavku?")) return;
    if (!user) return;

    try {
      console.log('Attempting to delete request:', requestId);
      
      // First delete any responses to this request
      const { error: responsesError } = await supabase
        .from('job_responses')
        .delete()
        .eq('job_request_id', requestId);

      if (responsesError) {
        console.error("Error deleting responses:", responsesError);
      }

      // Then delete the request itself
      const { error: requestError } = await supabase
        .from('job_requests')
        .delete()
        .eq('id', requestId)
        .eq('customer_id', user.id);

      if (requestError) {
        console.error("Error deleting request:", requestError);
        toast.error("Chyba pri mazaní požiadavky");
        return;
      }

      toast.success("Požiadavka bola vymazaná");
      queryClient.invalidateQueries({ queryKey: ['my-job-requests'] });
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("Nastala chyba pri mazaní požiadavky");
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('job_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .eq('customer_id', user.id);

    if (error) {
      console.error("Error updating status:", error);
      toast.error("Chyba pri zmene stavu");
    } else {
      toast.success("Stav bol aktualizovaný");
      queryClient.invalidateQueries({ queryKey: ['my-job-requests'] });
    }
  };

  const getCategoryDisplay = (request: JobRequest) => {
    if (request.custom_category && request.job_category === "Iné") {
      return request.custom_category;
    }
    return request.job_category;
  };

  const handleImageClick = (imageUrl: string) => {
    console.log('Image clicked:', imageUrl);
    setSelectedImageUrl(imageUrl);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Moje požiadavky</h2>
        <Link to="/post-job">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Pridať požiadavku
          </Button>
        </Link>
      </div>

      {jobRequests && jobRequests.length > 0 ? (
        <div className="space-y-4">
          {jobRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{getCategoryDisplay(request)}</CardTitle>
                  <div className="flex gap-2">
                    <Badge 
                      variant={
                        request.status === 'open' ? 'default' : 
                        request.status === 'closed' ? 'secondary' : 'outline'
                      }
                    >
                      {request.status === 'open' ? 'Otvorené' : 
                       request.status === 'closed' ? 'Zatvorené' : 'Dokončené'}
                    </Badge>
                    <Badge variant={request.urgency === 'asap' ? 'destructive' : 'secondary'}>
                      {request.urgency === 'asap' ? 'Naliehavé' : 'Flexibilné'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{request.location}</p>
              </CardHeader>
              <CardContent>
                {(request.image_urls && request.image_urls.length > 0) || request.image_url && (
                  <div className="mb-4">
                    {request.image_urls && request.image_urls.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {request.image_urls.map((url, index) => (
                          <div key={index} className="relative group cursor-pointer">
                            <img 
                              src={url} 
                              alt={`Job request ${index + 1}`} 
                              className="w-full h-24 object-cover rounded"
                              onClick={() => handleImageClick(url)}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <ZoomIn className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : request.image_url && (
                      <div className="relative group cursor-pointer">
                        <img 
                          src={request.image_url} 
                          alt="Job request" 
                          className="w-full h-32 object-cover rounded"
                          onClick={() => handleImageClick(request.image_url!)}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-sm mb-4">{request.description}</p>
                
                <div className="text-xs text-muted-foreground mb-4">
                  Vytvorené: {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm')}
                  {request.preferred_date && (
                    <span className="ml-4">
                      Preferovaný dátum: {format(new Date(request.preferred_date), 'dd.MM.yyyy')}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJobId(selectedJobId === request.id ? null : request.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {selectedJobId === request.id ? 'Skryť' : 'Zobraziť'} odpovede
                  </Button>

                  {request.status === 'open' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, 'closed')}
                      >
                        Zatvoriť
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vymazať
                      </Button>
                    </>
                  )}

                  {request.status === 'closed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, 'open')}
                      >
                        Znovu otvoriť
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vymazať
                      </Button>
                    </>
                  )}
                </div>

                {/* Show responses */}
                {selectedJobId === request.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Odpovede remeselníkov ({responses?.length || 0})
                    </h4>
                    
                    {responses && responses.length > 0 ? (
                      <div className="space-y-3">
                        {responses.map((response) => (
                          <div key={response.id} className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{response.craftsman_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(response.created_at), 'dd.MM.yyyy HH:mm')}
                              </span>
                            </div>
                            {response.message && (
                              <p className="text-sm text-gray-700">{response.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Zatiaľ neboli žiadne odpovede.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">Žiadne požiadavky</h3>
          <p className="text-muted-foreground mb-4">
            Zatiaľ ste nevytvorili žiadne požiadavky na prácu.
          </p>
          <Link to="/post-job">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Vytvoriť prvú požiadavku
            </Button>
          </Link>
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
  );
};

export default MyJobRequests;
