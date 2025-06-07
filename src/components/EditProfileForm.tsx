
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import SpecializationInput from "@/components/profile/SpecializationInput";
import { useProfile } from "@/contexts/ProfileContext";
import DeleteAccount from "@/components/profile/DeleteAccount";
import { craftCategories } from "@/constants/categories";

const baseSchema = z.object({
  name: z.string().min(2, { message: "Meno musí mať aspoň 2 znaky" }),
  phone: z.string().optional(),
  location: z.string().min(2, { message: "Zadajte platný názov mesta" }),
});

const craftsmanSchema = baseSchema.extend({
  trade_category: z.string().min(1, { message: "Vyberte kategóriu remesla" }),
  description: z.string().min(10, { message: "Popis musí mať aspoň 10 znakov" }),
  years_experience: z.string().min(1, { message: "Roky skúseností sú povinné" })
    .transform(val => val ? parseInt(val, 10) : undefined)
});

type ProfileData = {
  id: string;
  name: string;
  phone?: string | null;
  location?: string;
  trade_category?: string;
  description?: string | null;
  years_experience?: number | null;
  custom_specialization?: string | null;
  [key: string]: any; // To allow any other properties
};

interface EditProfileFormProps {
  profile: ProfileData;
  userType: string | null;
  onUpdate: (updatedProfile: ProfileData) => void;
}

const EditProfileForm = ({ profile, userType, onUpdate }: EditProfileFormProps) => {
  const { toast: uiToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCustomSpecialization, customSpecialization, saving } = useProfile();
  
  const schema = userType === 'craftsman' ? craftsmanSchema : baseSchema;
  
  type FormValues = z.infer<typeof schema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name || "",
      phone: profile.phone || "",
      location: profile.location || "",
      ...(userType === 'craftsman' ? {
        trade_category: profile.trade_category || "",
        description: profile.description || "",
        years_experience: profile.years_experience?.toString() || ""
      } : {})
    } as any,
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const tableName = userType === 'craftsman' ? 'craftsman_profiles' : 'customer_profiles';
      
      const { error } = await supabase
        .from(tableName)
        .update({
          name: data.name,
          phone: data.phone || null,
          location: data.location,
          ...(userType === 'craftsman' ? {
            trade_category: (data as any).trade_category,
            description: (data as any).description || null,
            years_experience: (data as any).years_experience || null
          } : {})
        })
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      uiToast({
        title: "Profil aktualizovaný",
        description: "Váš profil bol úspešne aktualizovaný",
      });
      
      toast.success("Profil aktualizovaný");

      onUpdate({
        ...profile,
        name: data.name,
        phone: data.phone || null,
        location: data.location,
        ...(userType === 'craftsman' ? {
          trade_category: (data as any).trade_category,
          description: (data as any).description || null,
          years_experience: (data as any).years_experience || null
        } : {})
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      uiToast({
        title: "Chyba",
        description: "Nastala chyba pri aktualizácii profilu",
        variant: "destructive",
      });
      
      toast.error("Chyba pri aktualizácii profilu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSpecialization = async (value: string) => {
    if (updateCustomSpecialization) {
      await updateCustomSpecialization(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upraviť profil</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno a priezvisko</FormLabel>
                  <FormControl>
                    <Input placeholder="Vaše meno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefónne číslo (voliteľné)</FormLabel>
                  <FormControl>
                    <Input placeholder="+421 903 123 456" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesto/obec</FormLabel>
                  <FormControl>
                    <Input placeholder="Bratislava" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {userType === 'craftsman' && (
              <>
                <FormField
                  control={form.control}
                  name={"trade_category" as keyof FormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategória remesla</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value as string}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte kategóriu" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {craftCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Custom specialization field */}
                <div className="space-y-2">
                  <FormLabel>Vlastná špecializácia (voliteľné)</FormLabel>
                  <SpecializationInput 
                    value={customSpecialization || ''}
                    onSave={handleSaveSpecialization}
                    isLoading={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ak vaše remeslo nie je v zozname, môžete pridať vlastnú špecializáciu.
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name={"years_experience" as keyof FormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roky skúseností</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          value={field.value as string || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={"description" as keyof FormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Popis služieb</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Popis vašich služieb a skúseností..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value as string || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Ukladám..." : "Uložiť zmeny"}
            </Button>
          </form>
        </Form>

        {/* Add the delete account section */}
        <DeleteAccount />
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
