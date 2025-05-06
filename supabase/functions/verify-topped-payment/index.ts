
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Verify topped payment function loaded");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get Stripe key from environment variable
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY environment variable is not set");
      throw new Error("Služba momentálne nie je dostupná. Chýba API kľúč.");
    }

    try {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      
      // Create Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase environment variables are not set");
        throw new Error("Supabase configuration is missing");
      }
      
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
      // Get authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization header is required");
      }
  
      // Get user from authorization header
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.getUser(token);
  
      if (userError || !user) {
        console.error("User authentication error:", userError);
        throw new Error("User not authenticated");
      }
  
      // Parse request
      const { sessionId } = await req.json();
      if (!sessionId) {
        throw new Error("Session ID is required");
      }
  
      // Retrieve the checkout session to check its status
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === "paid") {
        // Update the payment record
        const { error: updatePaymentError } = await supabaseClient
          .from("topped_payments")
          .update({
            payment_status: "completed",
            stripe_payment_id: session.payment_intent as string
          })
          .eq("stripe_session_id", sessionId);
  
        if (updatePaymentError) {
          console.error("Error updating payment record:", updatePaymentError);
          throw new Error("Error updating payment record");
        }
  
        // Update the craftsman profile to be topped
        const { error: updateProfileError } = await supabaseClient
          .from("craftsman_profiles")
          .update({
            is_topped: true,
            topped_until: new Date(session.metadata?.topped_until || "").toISOString()
          })
          .eq("id", user.id);
  
        if (updateProfileError) {
          console.error("Error updating craftsman profile:", updateProfileError);
          throw new Error("Error updating craftsman profile");
        }
  
        return new Response(
          JSON.stringify({ 
            success: true, 
            toppedUntil: session.metadata?.topped_until 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, status: session.payment_status }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      // Provide a more descriptive error message from Stripe
      throw new Error(`Stripe API error: ${stripeError.message || "Unknown Stripe error"}`);
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        errorCode: "topped_payment_verification_failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
