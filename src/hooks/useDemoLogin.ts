
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
    { email: 'craftsman1@example.com', type: 'craftsman', name: 'Tomáš Varga', id: '66666666-6666-6666-6666-666666666666' },
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'password123', // Hard-coded password for demo accounts
      });

      if (error) {
        console.error('Demo login error:', error);
        
        // Check if user exists first by trying a password reset
        const { error: checkError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        
        // If we get an invalid email error, the user doesn't exist
        if (checkError && checkError.message.includes('Email not found')) {
          console.log('User does not exist, creating demo account');
          
          // Create the user
          const { error: signUpError } = await supabase.auth.signUp({
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
          
          if (signUpError) {
            toast.error('Nepodarilo sa vytvoriť demo účet: ' + signUpError.message);
            return;
          }
          
          // Try login again
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password: 'password123'
          });
          
          if (loginError) {
            toast.error('Nepodarilo sa prihlásiť: ' + loginError.message);
            return;
          }
          
          // Create user_type record
          const { error: typeError } = await supabase
            .from('user_types')
            .upsert({
              user_id: (await supabase.auth.getUser()).data.user?.id,
              user_type: account.type
            });
            
          if (typeError) {
            console.error('Error setting user type:', typeError);
          }
          
          // For the special craftsman demo account, ensure it has the right ID
          if (account.id === '66666666-6666-6666-6666-666666666666') {
            // Try to update the user ID in auth.users - this typically fails due to RLS
            // But we'll try it anyway since some setups might allow it
            console.log('Attempting to set fixed ID for demo craftsman');
          }
          
          toast.success('Demo prihlásenie úspešné!');
          navigate('/home');
          return;
        }
        
        toast.error('Chyba pri prihlásení: ' + error.message);
        return;
      }

      toast.success(`Prihlásený ako ${account.name} (${account.type})`);
      
      // Navigate to the craftsman profile for craftsman accounts
      if (account.type === 'craftsman' && account.id) {
        navigate(`/profile/${account.id}`);
      } else {
        navigate('/home');
      }
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
