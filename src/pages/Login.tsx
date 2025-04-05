
import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Lock, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDemoLogin } from "@/hooks/useDemoLogin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const { isLoggingIn, loginWithDemo, demoAccounts } = useDemoLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle user type from query params (for Google Auth redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userType = params.get('userType');
    
    if (userType) {
      // Check if we have a session already (from OAuth redirect)
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Store the user type for this user
          try {
            const pendingUserType = userType === 'craftsman' ? 'craftsman' : 'customer';
            
            // Check if user type exists
            const { data: existingType } = await supabase
              .from('user_types')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (!existingType) {
              // Insert user type
              await supabase.from('user_types').insert({
                user_id: session.user.id,
                user_type: pendingUserType
              });
              
              // Insert profile based on user type
              if (pendingUserType === 'craftsman') {
                await supabase.from('craftsman_profiles').insert({
                  id: session.user.id,
                  name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                  email: session.user.email || '',
                  location: 'Please update',
                  trade_category: 'Please update'
                });
              } else {
                await supabase.from('customer_profiles').insert({
                  id: session.user.id,
                  name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                  email: session.user.email || '',
                  location: 'Please update'
                });
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
            console.error("Error processing OAuth user:", error);
            toast.error("Nastala chyba pri spracovaní prihlásenia", {
              duration: 3000,
            });
          }
        }
      };
      
      checkSession();
    }
  }, [location, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message, {
          duration: 3000,
        });
        return;
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
    } finally {
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

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-b from-white to-secondary/30">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Bežné prihlásenie</TabsTrigger>
              <TabsTrigger value="demo">Demo účty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="demo" className="space-y-4">
              <Card className="border-border/50 shadow-md animate-scale-in">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-semibold text-center">
                    Demo účty
                  </CardTitle>
                  <CardDescription className="text-center">
                    Vyberte si demo účet pre rýchle prihlásenie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Zákaznícke účty</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {demoAccounts
                        .filter(account => account.type === 'customer')
                        .map((account, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="text-left justify-start h-auto py-2"
                            onClick={() => loginWithDemo(account.email)}
                            disabled={isLoggingIn}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{account.name}</span>
                              <span className="text-xs text-muted-foreground">{account.email}</span>
                            </div>
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Remeselníci</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {demoAccounts
                        .filter(account => account.type === 'craftsman')
                        .map((account, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="text-left justify-start h-auto py-2"
                            onClick={() => loginWithDemo(account.email)}
                            disabled={isLoggingIn}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{account.name}</span>
                              <span className="text-xs text-muted-foreground">{account.email}</span>
                            </div>
                          </Button>
                        ))
                      }
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Heslo pre všetky demo účty: <code className="bg-gray-100 px-1 rounded">password123</code>
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-between p-6 bg-secondary rounded-b-lg">
                  <div className="text-sm text-muted-foreground text-center">
                    Späť na{" "}
                    <Link
                      to="/"
                      className="font-medium hover:text-foreground transition-colors"
                    >
                      úvodnú stránku
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
