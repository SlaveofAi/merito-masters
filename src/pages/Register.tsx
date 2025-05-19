
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, MapPin, Phone, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { createDefaultProfile } from "@/utils/profileCreation";

const craftCategories = [
  'Stolár',
  'Elektrikár',
  'Murár',
  'Inštalatér',
  'Maliar',
  'Podlahár',
  'Klampiar',
  'Zámočník',
  'Tesár',
  'Záhradník',
  'Kúrenár',
  'Sklenár',
  'Mechanik',
  'Pokrývač',
  'Zváračka/Zvárač',
  'Automechanik',
  'Obkladač',
  'Kominár',
  'Čalúnnik',
  'Studniar',
  'Kamenár'
];

type UserType = 'customer' | 'craftsman' | null;

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
    
    const storedUserType = sessionStorage.getItem("userType");
    if (storedUserType === 'customer' || storedUserType === 'craftsman') {
      setUserType(storedUserType);
    }
  }, [user, navigate]);

  const baseSchemaObject = {
    name: z.string().min(2, { message: "Meno musí mať aspoň 2 znaky" }),
    email: z.string().email({ message: "Neplatný email" }),
    phone: z.string().optional(),
    location: z.string().min(2, { message: "Zadajte platný názov mesta" }),
    password: z.string().min(6, { message: "Heslo musí mať aspoň 6 znakov" }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: "Musíte súhlasiť s podmienkami používania"
    }),
  };

  const customerSchema = z.object(baseSchemaObject).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Heslá sa nezhodujú",
      path: ["confirmPassword"],
    }
  );

  const craftsmanSchema = z.object({
    ...baseSchemaObject,
    tradeCategory: z.string().min(1, { message: "Vyberte kategóriu remesla" }),
    description: z.string().optional(),
    yearsExperience: z.string().optional()
      .transform(val => val ? parseInt(val, 10) : null)
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Heslá sa nezhodujú",
      path: ["confirmPassword"],
    }
  );

  type CustomerFormValues = z.infer<typeof customerSchema>;
  type CraftsmanFormValues = z.infer<typeof craftsmanSchema>;
  
  type FormValues = UserType extends 'craftsman' ? CraftsmanFormValues : CustomerFormValues;

  const schema = userType === 'craftsman' ? craftsmanSchema : customerSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      ...(userType === 'craftsman' ? { tradeCategory: "", description: "", yearsExperience: "" } : {})
    } as any,
  });

  const onSubmit = async (data: FormValues) => {
    if (!userType) {
      toast.error("Prosím, vyberte typ užívateľa", {
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const userMetadata: Record<string, any> = {
        name: data.name,
        user_type: userType
      };
      
      // For craftsmen, include the selected trade_category in metadata
      if (userType === 'craftsman' && 'tradeCategory' in data) {
        userMetadata.trade_category = (data as CraftsmanFormValues).tradeCategory;
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: userMetadata
        }
      });

      if (error) {
        console.error("Authentication error:", error);
        toast.error(error.message, {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Nastala chyba pri registrácii užívateľa", {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      console.log("User registered successfully:", authData.user.id);
      
      sessionStorage.setItem("userType", userType);
      localStorage.setItem("userType", userType); // Ensure user type is available in localStorage
      
      // Try to sign in immediately after registration
      try {
        const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });
        
        if (signInError) {
          console.error("Error signing in after registration:", signInError);
        }
      } catch (signInErr) {
        console.error("Exception during sign in after registration:", signInErr);
      }

      const { error: userTypeError } = await supabase
        .from('user_types')
        .insert({
          user_id: authData.user.id,
          user_type: userType
        });

      if (userTypeError) {
        console.error("Error storing user type:", userTypeError);
        toast.error("Nastala chyba pri ukladaní typu užívateľa", {
          description: userTypeError.message,
          duration: 5000,
        });
      } else {
        console.log("User type stored successfully");
      }

      // Store profile data in appropriate table
      if (userType === 'craftsman') {
        const craftsmanData = {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          location: data.location,
          trade_category: (data as CraftsmanFormValues).tradeCategory,
          description: (data as CraftsmanFormValues).description || null,
          years_experience: (data as CraftsmanFormValues).yearsExperience || null,
          custom_specialization: (data as CraftsmanFormValues).tradeCategory // Store selected category also as custom specialization
        };

        console.log("Storing craftsman profile:", craftsmanData);
        const { error: craftsmanError } = await supabase
          .from('craftsman_profiles')
          .insert(craftsmanData);

        if (craftsmanError) {
          console.error("Error storing craftsman profile:", craftsmanError);
          toast.error("Nastala chyba pri ukladaní profilu remeselníka", {
            duration: 5000,
          });
        } else {
          console.log("Craftsman profile stored successfully");
        }
      } else {
        const customerData = {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          location: data.location
        };

        console.log("Storing customer profile:", customerData);
        const { error: customerError } = await supabase
          .from('customer_profiles')
          .insert(customerData);

        if (customerError) {
          console.error("Error storing customer profile:", customerError);
          toast.error("Nastala chyba pri ukladaní profilu zákazníka", {
            duration: 5000,
          });
        } else {
          console.log("Customer profile stored successfully");
        }
      }

      // Create default profile immediately with a slight delay
      if (authData.user && authData.session) {
        try {
          // Add a slight delay to ensure DB operations complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          await createDefaultProfile(
            authData.user,
            userType,
            true,
            () => console.log("Default profile created after registration")
          );
        } catch (profileError) {
          console.error("Error creating default profile:", profileError);
        }
      }

      toast.success("Registrácia úspešná!", {
        duration: 5000,
      });
      
      if (authData.session) {
        // Wait briefly to ensure data is saved before redirecting
        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 1000);
      } else {
        // If email confirmation is required, navigate to the login page
        toast.info("Na vašu emailovú adresu sme odoslali potvrdzovací email", {
          description: "Pre dokončenie registrácie prosím potvrďte svoju emailovú adresu",
          duration: 8000,
        });
        navigate("/login", { state: { emailConfirmationRequired: true } });
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Pri registrácii nastala chyba", {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Vyberte typ účtu</CardTitle>
            <CardDescription>
              Prosím, vyberte, či ste remeselník alebo zákazník
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              onClick={() => setUserType('craftsman')}
              className="h-auto py-8 flex flex-col gap-2"
            >
              <span className="text-lg font-medium">Som remeselník</span>
              <span className="text-sm font-normal text-muted-foreground">
                Chcem ponúkať svoje remeselnícke služby
              </span>
            </Button>
            <Button 
              onClick={() => setUserType('customer')}
              variant="outline" 
              className="h-auto py-8 flex flex-col gap-2"
            >
              <span className="text-lg font-medium">Som zákazník</span>
              <span className="text-sm font-normal text-muted-foreground">
                Hľadám služby remeselníkov
              </span>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
              Už máte účet? Prihláste sa
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-secondary/30">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-md animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Registrácia {userType === 'craftsman' ? 'remeselníka' : 'zákazníka'}
            </CardTitle>
            <CardDescription className="text-center">
              {userType === 'craftsman' 
                ? 'Vytvorte si účet a začnite ponúkať svoje služby' 
                : 'Vytvorte si účet a začnite vyhľadávať remeselníkov'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Meno a priezvisko</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="Ján Novák"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="meno@example.sk"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Telefónne číslo (voliteľné)</FormLabel>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="+421 903 123 456"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Mesto/obec</FormLabel>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="Bratislava"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {userType === 'craftsman' && (
                  <>
                    <FormField
                      control={form.control}
                      name={"tradeCategory" as keyof FormValues}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Kategória remesla</FormLabel>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground z-10" />
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value as string}
                              >
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="Vyberte kategóriu" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                  {craftCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={"yearsExperience" as keyof FormValues}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Roky skúseností (voliteľné)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5"
                              {...field}
                              value={field.value as string}
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
                        <FormItem className="space-y-2">
                          <FormLabel>Popis služieb (voliteľné)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Popis vašich služieb a skúseností..."
                              className="min-h-[100px]"
                              {...field}
                              value={field.value as string}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Heslo</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Potvrdenie hesla</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Súhlasím s{" "}
                          <Link
                            to="/terms"
                            className="text-primary hover:underline"
                          >
                            podmienkami používania
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrujem..." : "Zaregistrovať sa"}
                </Button>
              </form>
            </Form>

            <div className="text-sm text-muted-foreground text-center mt-6">
              Už máte účet?{" "}
              <Link
                to="/login"
                className="font-medium hover:text-foreground transition-colors"
              >
                Prihláste sa
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
