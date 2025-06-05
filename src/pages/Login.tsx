
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Lock, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { createDefaultProfile } from "@/utils/profileCreation";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check for email confirmation required status
  useEffect(() => {
    // Check if coming from registration with email confirmation required
    if (location.state?.emailConfirmationRequired) {
      setShowEmailConfirmation(true);
    }
    
    // Check for email confirmation in URL parameter
    const params = new URLSearchParams(location.search);
    if (params.get('email_confirmed') === 'true') {
      toast.success("E-mailová adresa bola úspešne overená", {
        duration: 5000,
      });
      
      // Handle post-confirmation setup
      setTimeout(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            console.log("Email confirmed, user session available");
            
            // Get stored registration data
            const storedData = localStorage.getItem("registrationData");
            if (storedData) {
              const { userType, userData } = JSON.parse(storedData);
              console.log("Setting up user after email confirmation:", userType);
              
              // Store user type in database
              try {
                const { error: userTypeError } = await supabase
                  .from('user_types')
                  .upsert({
                    user_id: session.user.id,
                    user_type: userType
                  });
                
                if (userTypeError) {
                  console.error("Error storing user type:", userTypeError);
                } else {
                  console.log("User type stored successfully");
                  localStorage.setItem("userType", userType);
                }
                
                // Create profile
                await createDefaultProfile(
                  session.user,
                  userType,
                  true,
                  () => {
                    console.log("Profile created after email confirmation");
                    toast.success("Váš profil bol vytvorený!");
                    
                    // Clean up stored data
                    localStorage.removeItem("registrationData");
                    
                    // Navigate to appropriate page
                    if (userType === 'customer') {
                      navigate("/profile/reviews", { replace: true });
                    } else {
                      navigate("/profile", { replace: true });
                    }
                  }
                );
              } catch (error) {
                console.error("Error in post-confirmation setup:", error);
                navigate("/home");
              }
            } else {
              // No stored data, just redirect to home
              navigate("/home");
            }
          }
        } catch (error) {
          console.error("Error handling email confirmation:", error);
        }
      }, 1000);
    }
    
    // Handle user type from query params (for Google Auth redirect)
    const userType = params.get('userType');
    
    if (userType) {
      // Check if we have a session already (from OAuth redirect)
      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Store the user type for this user
            const pendingUserType = userType === 'craftsman' ? 'craftsman' : 'customer';
            
            // Save user type to localStorage immediately for quick access
            localStorage.setItem("userType", pendingUserType);
            
            try {
              // Check if user type exists in a try-catch to handle RLS issues
              const { data: existingType } = await supabase
                .from('user_types')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
                
              if (!existingType) {
                // Insert user type with error handling
                const { error: typeError } = await supabase
                  .from('user_types')
                  .insert({
                    user_id: session.user.id,
                    user_type: pendingUserType
                  });
                
                if (typeError) {
                  console.error("Error inserting user type:", typeError);
                  // Continue anyway - we'll try again later
                }
                
                // Update user metadata as well
                await supabase.auth.updateUser({
                  data: { user_type: pendingUserType }
                });
                
                // Insert profile based on user type with error handling
                if (pendingUserType === 'craftsman') {
                  const { error: profileError } = await supabase
                    .from('craftsman_profiles')
                    .insert({
                      id: session.user.id,
                      name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                      email: session.user.email || '',
                      location: 'Please update',
                      trade_category: 'Please update'
                    });
                    
                  if (profileError) {
                    console.error("Error creating craftsman profile:", profileError);
                    // Continue anyway
                  }
                } else {
                  const { error: profileError } = await supabase
                    .from('customer_profiles')
                    .insert({
                      id: session.user.id,
                      name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                      email: session.user.email || '',
                      location: 'Please update'
                    });
                    
                  if (profileError) {
                    console.error("Error creating customer profile:", profileError);
                    // Continue anyway
                  }
                }
                
                toast.success("Profil bol vytvorený", {
                  duration: 3000,
                });
              }
              
              // Clean up the URL
              window.history.replaceState({}, document.title, '/login');
              
              // Redirect to home
              navigate('/home');
            } catch (error) {
              console.error("Error in profile creation:", error);
              // Still redirect to home, we'll handle profile creation there
              navigate('/home');
            }
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      };
      
      checkSession();
    }
  }, [location, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Check if error is due to email not confirmed
        if (error.message.includes('Email not confirmed')) {
          setShowEmailConfirmation(true);
          toast.error("Prosím, potvrďte svoju e-mailovú adresu", {
            duration: 5000,
          });
        } else {
          toast.error(error.message, {
            duration: 3000,
          });
        }
        setIsLoading(false);
        return;
      }

      // After successful login, fetch user type to cache it immediately
      if (authData?.user) {
        try {
          const { data: userTypeData } = await supabase
            .from('user_types')
            .select('user_type')
            .eq('user_id', authData.user.id)
            .maybeSingle();
            
          if (userTypeData && (userTypeData.user_type === 'customer' || userTypeData.user_type === 'craftsman')) {
            // Store in localStorage for immediate access on page load
            localStorage.setItem("userType", userTypeData.user_type);
            
            // Also update the user metadata to ensure consistency
            await supabase.auth.updateUser({
              data: { user_type: userTypeData.user_type }
            });
          }
        } catch (fetchError) {
          console.error("Error fetching user type after login:", fetchError);
          // Non-blocking error, we'll continue with login
        }
      }

      toast.success("Prihlásenie úspešné!", {
        duration: 3000,
      });
      
      // Redirect to home page after successful login
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Pri prihlásení nastala chyba", {
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    const email = form.getValues("email");
    
    if (!email) {
      toast.error("Prosím zadajte e-mailovú adresu", { 
        duration: 3000 
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?email_confirmed=true`
        }
      });
      
      if (error) {
        toast.error(error.message, { duration: 3000 });
      } else {
        toast.success("Potvrdzovací e-mail bol odoslaný", { 
          description: "Skontrolujte svoju e-mailovú schránku",
          duration: 5000 
        });
      }
    } catch (error) {
      console.error("Error resending confirmation email:", error);
      toast.error("Nastala chyba pri odosielaní potvrdzovacieho e-mailu", { 
        duration: 3000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-b from-white to-secondary/30">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-md animate-scale-in">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center">
                Prihlásenie
              </CardTitle>
              <CardDescription className="text-center">
                Prihláste sa do svojho účtu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showEmailConfirmation && (
                <Alert className="bg-amber-50 border-amber-200 mb-4">
                  <CheckCircle className="h-5 w-5 text-amber-500" />
                  <AlertTitle className="text-amber-800">Overte svoj e-mail</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Na vašu e-mailovú adresu sme odoslali potvrdzovací e-mail. Pre dokončenie registrácie prosím kliknite na odkaz v e-maile.
                    <Button
                      variant="link"
                      className="px-0 text-amber-800 font-semibold"
                      onClick={handleResendConfirmationEmail}
                      disabled={isLoading}
                    >
                      Odoslať znova
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel>Heslo</FormLabel>
                          <Link
                            to="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Zabudnuté heslo?
                          </Link>
                        </div>
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Prihlasujem..." : "Prihlásiť sa"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-between p-6 bg-secondary rounded-b-lg">
              <div className="text-sm text-muted-foreground text-center">
                Nemáte ešte účet?{" "}
                <Link
                  to="/register"
                  className="font-medium hover:text-foreground transition-colors"
                >
                  Zaregistrujte sa
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
