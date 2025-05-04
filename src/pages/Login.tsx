
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const emailConfirmationRequired = location.state?.emailConfirmationRequired || false;
  const fromTerms = location.pathname.includes('/terms');

  useEffect(() => {
    if (user) {
      navigate("/home");
    }

    // Check if we have a userType parameter in the URL (from Google auth)
    const params = new URLSearchParams(location.search);
    const userType = params.get('userType');
    
    if (userType === 'customer' || userType === 'craftsman') {
      sessionStorage.setItem('userType', userType);
    }
  }, [user, navigate, location]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message, {
          duration: 5000,
        });
        return;
      }

      toast.success("Prihlásenie úspešné!", {
        duration: 3000,
      });
      
      navigate("/profile");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Pri prihlásení nastala chyba", {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) {
        toast.error(error.message, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Google signin error:", error);
      toast.error("Pri prihlásení cez Google nastala chyba", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-secondary/30">
      <Card className="w-full max-w-md border-border/50 shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">
            Prihlásenie
          </CardTitle>
          <CardDescription className="text-center">
            Zadajte svoje prihlasovacie údaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailConfirmationRequired && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm mb-4">
              <p className="font-medium">Na váš email bola zaslaná potvrdzovacia správa</p>
              <p>Pre dokončenie registrácie potvrďte svoju emailovú adresu kliknutím na odkaz v emaile.</p>
            </div>
          )}
          
          {fromTerms && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-md text-green-800 text-sm mb-4">
              <p className="font-medium">Ďakujeme za akceptáciu podmienok používania</p>
              <p>Teraz sa môžete prihlásiť do svojho účtu.</p>
            </div>
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
                        to="/forgotten-password"
                        className="text-sm text-right text-primary hover:underline"
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

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
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

          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className="bg-white"
              onClick={handleGoogleSignIn}
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
        <CardFooter className="flex flex-col items-center p-6 bg-secondary rounded-b-lg">
          <div className="text-sm text-muted-foreground">
            Nemáte účet?{" "}
            <Link to="/register" className="font-medium hover:text-foreground transition-colors">
              Zaregistrujte sa
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
