
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Lock, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, resetPasswordSchema, type LoginFormValues, type ResetPasswordFormValues } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check for password reset tokens and other URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    console.log("URL params:", { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
    
    // Check if this is a password reset flow
    if (type === 'recovery' && accessToken && refreshToken) {
      console.log("Password reset mode detected");
      setIsPasswordResetMode(true);
      
      // Set the session with the tokens from URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error("Error setting session:", error);
          toast.error("Neplatný alebo expirovaný odkaz na obnovenie hesla");
          setIsPasswordResetMode(false);
          // Clean up URL
          window.history.replaceState({}, document.title, '/login');
        } else {
          console.log("Session set successfully for password reset");
        }
      });
      
      return;
    }

    // Check for email confirmation required status
    if (location.state?.emailConfirmationRequired) {
      setShowEmailConfirmation(true);
    }
    
    // Check for email confirmation in URL parameter
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

  const onResetPassword = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting to update password");
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        console.error("Password update error:", error);
        toast.error(`Chyba pri zmene hesla: ${error.message}`, {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      console.log("Password updated successfully");
      toast.success("Heslo bolo úspešne zmenené!", {
        duration: 5000,
      });

      // Clean up URL and redirect to home
      window.history.replaceState({}, document.title, '/login');
      setIsPasswordResetMode(false);
      navigate("/home");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Pri zmene hesla nastala chyba", {
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    const email = loginForm.getValues("email");
    
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

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Prosím zadajte e-mailovú adresu", { 
        duration: 3000 
      });
      return;
    }

    setIsResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        toast.error(error.message, { duration: 3000 });
      } else {
        toast.success("E-mail na obnovenie hesla bol odoslaný", { 
          description: "Skontrolujte svoju e-mailovú schránku",
          duration: 5000 
        });
        setIsResetModalOpen(false);
        setResetEmail("");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Nastala chyba pri odosielaní e-mailu na obnovenie hesla", { 
        duration: 3000 
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-b from-white to-secondary/30">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-md animate-scale-in">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center">
                {isPasswordResetMode ? "Nastaviť nové heslo" : "Prihlásenie"}
              </CardTitle>
              <CardDescription className="text-center">
                {isPasswordResetMode 
                  ? "Zadajte svoje nové heslo" 
                  : "Prihláste sa do svojho účtu"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showEmailConfirmation && !isPasswordResetMode && (
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
              
              {isPasswordResetMode ? (
                <Form {...resetPasswordForm}>
                  <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                    <FormField
                      control={resetPasswordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Nové heslo</FormLabel>
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
                      control={resetPasswordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Potvrdiť nové heslo</FormLabel>
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
                      {isLoading ? "Nastavujem heslo..." : "Nastaviť nové heslo"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
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
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <div className="flex items-center justify-between">
                            <FormLabel>Heslo</FormLabel>
                            <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="link"
                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors p-0 h-auto"
                                  type="button"
                                >
                                  Zabudnuté heslo?
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Obnovenie hesla</DialogTitle>
                                  <DialogDescription>
                                    Zadajte svoju e-mailovú adresu a pošleme vám odkaz na obnovenie hesla.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      type="email"
                                      placeholder="meno@example.sk"
                                      className="pl-10"
                                      value={resetEmail}
                                      onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsResetModalOpen(false)}
                                      className="flex-1"
                                      disabled={isResetLoading}
                                    >
                                      Zrušiť
                                    </Button>
                                    <Button
                                      onClick={handleForgotPassword}
                                      className="flex-1"
                                      disabled={isResetLoading}
                                    >
                                      {isResetLoading ? "Odosielam..." : "Odoslať"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
              )}
            </CardContent>
            {!isPasswordResetMode && (
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
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
