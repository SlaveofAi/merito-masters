import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { craftCategories } from "@/constants/categories";
import { ArrowLeft, Send } from "lucide-react";
import ImageGalleryUploader from "@/components/ImageGalleryUploader";

const PostJob = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    jobCategory: "",
    customCategory: "",
    location: "",
    description: "",
    preferredDate: "",
    urgency: "flexible",
    customerName: "",
    customerEmail: user?.email || "",
    customerPhone: ""
  });

  // Redirect if not a customer
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (userType && userType !== 'customer') {
      toast.error("Len zákazníci môžu pridávať požiadavky");
      navigate("/requests");
      return;
    }
  }, [user, userType, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length > 5) { // 5 images limit
        toast.error("Obrázky sú príliš veľké (max 5)");
        return;
      }
      // Convert FileList to File[]
      setSelectedImages(Array.from(files));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-requests')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('job-requests')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.jobCategory || !formData.location || !formData.description || !formData.customerName) {
      toast.error("Prosím vyplňte všetky povinné polia");
      return;
    }

    // If "Iné" is selected, custom category is required
    if (formData.jobCategory === "Iné" && !formData.customCategory.trim()) {
      toast.error("Prosím zadajte vlastnú kategóriu");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages);
        if (imageUrls.length === 0 && selectedImages.length > 0) {
          toast.error("Chyba pri nahrávaní obrázkov");
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase
        .from('job_requests')
        .insert({
          customer_id: user.id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone || null,
          job_category: formData.jobCategory,
          custom_category: formData.jobCategory === "Iné" ? formData.customCategory : null,
          location: formData.location,
          description: formData.description,
          preferred_date: formData.preferredDate || null,
          urgency: formData.urgency,
          image_urls: imageUrls.length > 0 ? imageUrls : null
        });

      if (error) {
        console.error("Error creating job request:", error);
        toast.error("Chyba pri vytváraní požiadavky");
      } else {
        toast.success("Požiadavka bola úspešne vytvorená!");
        navigate("/requests");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Nastala neočakávaná chyba");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (userType && userType !== 'customer')) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/requests")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na požiadavky
          </Button>
          <h1 className="text-3xl font-bold">Pridať novú požiadavku</h1>
          <p className="text-muted-foreground mt-2">
            Opíšte svoju požiadavku a nechajte remeselníkov, aby vám pomohli
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detaily požiadavky</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobCategory">Kategória práce *</Label>
                <Select value={formData.jobCategory} onValueChange={(value) => handleInputChange('jobCategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategóriu" />
                  </SelectTrigger>
                  <SelectContent>
                    {craftCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Iné">Iné</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.jobCategory === "Iné" && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory">Vlastná kategória *</Label>
                  <Input
                    id="customCategory"
                    placeholder="Zadajte vlastnú kategóriu..."
                    value={formData.customCategory}
                    onChange={(e) => handleInputChange('customCategory', e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">Lokalita *</Label>
                <Input
                  id="location"
                  placeholder="napr. Bratislava, Košice..."
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Popis práce *</Label>
                <Textarea
                  id="description"
                  placeholder="Opíšte podrobne, akú prácu potrebujete urobiť..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Pridať obrázky (max 5)</Label>
                <ImageGalleryUploader
                  images={selectedImages}
                  onImagesChange={setSelectedImages}
                  maxImages={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferovaný dátum</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Naliehavosť</Label>
                <RadioGroup
                  value={formData.urgency}
                  onValueChange={(value) => handleInputChange('urgency', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible">Flexibilné (môže počkať)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asap" id="asap" />
                    <Label htmlFor="asap">Čo najskôr</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Kontaktné údaje</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Meno *</Label>
                    <Input
                      id="customerName"
                      placeholder="Vaše meno"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="vas@email.com"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Telefón</Label>
                    <Input
                      id="customerPhone"
                      placeholder="+421 123 456 789"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Vytváranie..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Vytvoriť požiadavku
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PostJob;
