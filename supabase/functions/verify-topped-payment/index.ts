
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
      throw new Error("Missing API key: STRIPE_SECRET_KEY");
    }

    // Validate Stripe API key format
    if (!stripeKey.startsWith("sk_test_") && !stripeKey.startsWith("sk_live_")) {
      console.error("Invalid Stripe API key format:", stripeKey.substring(0, 7) + "...");
      throw new Error("Invalid Stripe API key format. Keys should start with sk_test_ or sk_live_");
    }
      
    // Initialize Stripe with proper error handling
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });
      
    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Supabase environment variables are not set");
      throw new Error("Missing Supabase configuration");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    // Create service role client for database operations (bypasses RLS)
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

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
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Invalid request body");
    }
    
    const { sessionId } = body;
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log("Verifying payment for session:", sessionId);
    
    // Retrieve the checkout session to check its status
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("Stripe session retrieved:", {
      id: session.id,
      payment_status: session.payment_status,
      client_reference_id: session.client_reference_id,
      metadata: session.metadata
    });
    
    if (session.payment_status === "paid") {
      console.log("Payment verified as paid for session:", sessionId);
      
      // Extract topped_until from metadata with better error handling
      let toppedUntil = null;
      if (session.metadata?.topped_until) {
        try {
          toppedUntil = new Date(session.metadata.topped_until).toISOString();
          console.log("Topped until date extracted:", toppedUntil);
        } catch (error) {
          console.error("Error parsing topped_until date:", error);
          // Fallback: create date 7 days from now
          const fallbackDate = new Date();
          fallbackDate.setDate(fallbackDate.getDate() + 7);
          toppedUntil = fallbackDate.toISOString();
          console.log("Using fallback topped_until date:", toppedUntil);
        }
      } else {
        console.log("No topped_until in metadata, creating fallback date");
        // Fallback: create date 7 days from now
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 7);
        toppedUntil = fallbackDate.toISOString();
        console.log("Fallback topped_until date:", toppedUntil);
      }
      
      // Update the payment record using service role
      const { error: updatePaymentError } = await supabaseService
        .from("topped_payments")
        .update({
          payment_status: "completed",
          stripe_payment_id: session.payment_intent as string
        })
        .eq("stripe_session_id", sessionId);

      if (updatePaymentError) {
        console.error("Error updating payment record:", updatePaymentError);
        throw new Error(`Error updating payment record: ${updatePaymentError.message}`);
      }

      console.log("Payment record updated successfully");

      // Update the craftsman profile to be topped using service role
      const { error: updateProfileError } = await supabaseService
        .from("craftsman_profiles")
        .update({
          is_topped: true,
          topped_until: toppedUntil
        })
        .eq("id", user.id);

      if (updateProfileError) {
        console.error("Error updating craftsman profile:", updateProfileError);
        throw new Error(`Error updating craftsman profile: ${updateProfileError.message}`);
      }

      console.log("Craftsman profile updated successfully with topped status");

      return new Response(
        JSON.stringify({ 
          success: true, 
          toppedUntil: toppedUntil,
          message: "Payment verified and topped status activated"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log("Payment not completed for session:", sessionId, "Status:", session.payment_status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: session.payment_status,
          message: `Payment not completed. Current status: ${session.payment_status}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in verify-topped-payment function:", error);
    
    // Extract meaningful error message
    let errorMessage = "Unknown error occurred";
    let errorCode = "verification_error";
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    if (errorMessage.includes("Invalid API Key")) {
      errorCode = "invalid_api_key";
    } else if (errorMessage.includes("No such session")) {
      errorCode = "session_not_found";
    } else if (errorMessage.includes("not authenticated")) {
      errorCode = "user_not_authenticated";
    } else if (errorMessage.includes("payment record")) {
      errorCode = "payment_record_error";
    } else if (errorMessage.includes("craftsman profile")) {
      errorCode = "profile_update_error";
    }
    
    // Return a clear error response
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        errorCode: errorCode,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
