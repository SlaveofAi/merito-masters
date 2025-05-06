
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { user } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

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
                }
                
                // Update user metadata as well
                await supabase.auth.updateUser({
                  data: { user_type: pendingUserType }
                });
                
                // Create profile
                if (pendingUserType === 'craftsman') {
                  await createCraftsmanProfile(session.user);
                } else {
                  await createCustomerProfile(session.user);
                }
              }
              
              // Clean up the URL
              window.history.replaceState({}, document.title, '/login');
              
              // Redirect to home
              toast.success("Prihlásenie úspešné", { duration: 3000 });
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

  const createCraftsmanProfile = async (user: any) => {
    try {
      const { error: profileError } = await supabase
        .from('craftsman_profiles')
        .insert({
          id: user.id,
          name: user.user_metadata.full_name || user.user_metadata.name || 'User',
          email: user.email || '',
          location: 'Please update',
          trade_category: 'Please update'
        });
        
      if (profileError) {
        console.error("Error creating craftsman profile:", profileError);
      } else {
        toast.success("Profil bol vytvorený", { duration: 3000 });
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const createCustomerProfile = async (user: any) => {
    try {
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .insert({
          id: user.id,
          name: user.user_metadata.full_name || user.user_metadata.name || 'User',
          email: user.email || '',
          location: 'Please update'
        });
        
      if (profileError) {
        console.error("Error creating customer profile:", profileError);
      } else {
        toast.success("Profil bol vytvorený", { duration: 3000 });
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginAttempts(prev => prev + 1);

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
          // Fetch from localStorage first as fastest option
          const cachedType = localStorage.getItem("userType");
          
          if (cachedType === 'customer' || cachedType === 'craftsman') {
            console.log("Using cached user type:", cachedType);
          } else {
            // Try to get from metadata first
            if (authData?.user?.user_metadata?.user_type === 'customer' || 
                authData?.user?.user_metadata?.user_type === 'craftsman') {
              localStorage.setItem("userType", authData.user.user_metadata.user_type);
            } else {
              // Last resort - check database
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
            }
          }
        } catch (fetchError) {
          console.error("Error fetching user type after login:", fetchError);
          // Non-blocking error, we'll continue with login
        }
      }

      toast.success("Prihlásenie úspešné!", {
        duration: 3000,
      });
      
      // Force reload to ensure all auth state is properly updated
      if (loginAttempts > 1) {
        window.location.href = '/home';
      } else {
        // Redirect to home page after successful login
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Pri prihlásení nastala chyba", {
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });

      if (error) {
        toast.error(error.message, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Pri prihlásení cez Google nastala chyba", {
        duration: 3000,
      });
    } finally {
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
        email: email
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Alebo pokračujte s
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="bg-white" 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Prihlásiť sa cez Google
                </Button>
              </div>
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
