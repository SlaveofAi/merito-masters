
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Meno musí mať aspoň 2 znaky" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileData {
  id: string;
  name: string | null;
}

interface EditProfileFormProps {
  profile: ProfileData;
  onUpdate: (updatedProfile: ProfileData) => void;
}

const EditProfileForm = ({ profile, onUpdate }: EditProfileFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: data.name, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profil aktualizovaný",
        description: "Váš profil bol úspešne aktualizovaný",
      });

      onUpdate({ ...profile, name: data.name });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Chyba",
        description: "Nastala chyba pri aktualizácii profilu",
        variant: "destructive",
      });
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
                  <FormLabel>Meno</FormLabel>
                  <FormControl>
                    <Input placeholder="Vaše meno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Uložiť zmeny
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
