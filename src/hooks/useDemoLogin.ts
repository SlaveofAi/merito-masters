
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useDemoLogin = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // List of demo emails and their types
  const demoAccounts = [
    { email: 'customer1@example.com', type: 'customer', name: 'Marek Novák' },
    { email: 'customer2@example.com', type: 'customer', name: 'Jana Kováčová' },
    { email: 'customer3@example.com', type: 'customer', name: 'Peter Horváth' },
    { email: 'craftsman1@example.com', type: 'craftsman', name: 'Tomáš Varga' },
    { email: 'craftsman2@example.com', type: 'craftsman', name: 'Martin Tóth' },
    { email: 'craftsman3@example.com', type: 'craftsman', name: 'Milan Baláž' }
  ];

  const loginWithDemo = async (email: string) => {
    setIsLoggingIn(true);
    try {
      // Find the account details
      const account = demoAccounts.find(acc => acc.email === email);
      
      if (!account) {
        toast.error('Demo účet nebol nájdený');
        return;
      }

      // For demo accounts, we use a fixed password
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'password123', // Hard-coded password for demo accounts
      });

      if (error) {
        console.error('Demo login error:', error);
        
        // Special handling for RLS or auth errors with demo accounts
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Demo účet vyžaduje obnovenie. Pokúsim sa vytvoriť novú reláciu.', { duration: 5000 });
          
          // Try a workaround with admin signup and then login
          const signUpResult = await supabase.auth.signUp({
            email,
            password: 'password123',
            options: {
              data: {
                name: account.name,
                full_name: account.name,
                user_type: account.type
              }
            }
          });
          
          if (signUpResult.error) {
            toast.error('Nepodarilo sa vytvoriť demo účet: ' + signUpResult.error.message);
            return;
          }
          
          // Try login again
          const loginResult = await supabase.auth.signInWithPassword({
            email,
            password: 'password123'
          });
          
          if (loginResult.error) {
            toast.error('Nepodarilo sa prihlásiť: ' + loginResult.error.message);
            return;
          }
          
          toast.success('Demo prihlásenie úspešné!');
          navigate('/home');
          return;
        }
        
        toast.error('Chyba pri prihlásení: ' + error.message);
        return;
      }

      toast.success(`Prihlásený ako ${account.name} (${account.type})`);
      navigate('/home');
    } catch (error: any) {
      toast.error('Neočakávaná chyba: ' + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return {
    isLoggingIn,
    loginWithDemo,
    demoAccounts
  };
};
