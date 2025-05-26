
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
import { ArrowLeft, Send, Upload, X } from "lucide-react";

const PostJob = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Obrázok je príliš veľký (max 5MB)");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `job-requests/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('job-requests')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('job-requests')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
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
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast.error("Chyba pri nahrávaní obrázka");
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
          image_url: imageUrl
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
                <Label>Pridať obrázok</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Kliknite pre nahranie obrázka
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG až 5MB
                          </span>
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
