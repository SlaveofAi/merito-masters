
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Create topped session function loaded");

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

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables are not set");
      throw new Error("Missing Supabase configuration");
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

    // Parse request body
    const requestData = await req.json();
    const { days = 7, amount = 1000 } = requestData; // Default 7 days and 10 EUR

    // Calculate end date - default to 7 days from now
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setDate(currentDate.getDate() + days);

    // Get the craftsman profile to verify the user is a craftsman
    const { data: craftsmanData, error: craftsmanError } = await supabaseClient
      .from("craftsman_profiles")
      .select("id, name")
      .eq("id", user.id)
      .single();

    if (craftsmanError || !craftsmanData) {
      console.error("Craftsman profile not found:", craftsmanError);
      throw new Error("Craftsman profile not found");
    }

    console.log("Creating checkout session for craftsman:", user.id);
    
    try {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      
      // Ensure Stripe object was created successfully
      if (!stripe) {
        throw new Error("Failed to initialize Stripe");
      }
      
      // Origin for success/cancel URLs
      const origin = req.headers.get("origin") || 'https://majstri.com';
  
      // Create a new checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Top Craftsman Feature - 1 Week",
                description: "Feature your profile at the top of search results for one week",
              },
              unit_amount: amount, // amount in cents (10 EUR)
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/profile/${user.id}?topped=success`,
        cancel_url: `${origin}/profile/${user.id}?topped=canceled`,
        client_reference_id: user.id,
        metadata: {
          craftsman_id: user.id,
          topped_days: days,
          topped_until: endDate.toISOString(),
        },
      });

      if (!session || !session.id) {
        throw new Error("Failed to create Stripe checkout session");
      }
  
      // Save topped payment record in database with pending status
      const { error: paymentError } = await supabaseClient
        .from("topped_payments")
        .insert({
          craftsman_id: user.id,
          amount: amount,
          payment_status: "pending",
          stripe_session_id: session.id,
          topped_start: currentDate.toISOString(),
          topped_end: endDate.toISOString(),
        });
  
      if (paymentError) {
        console.error("Error saving payment record:", paymentError);
        // Continue despite this error, as the session was created successfully
      }
  
      console.log("Checkout session created successfully:", session.id);
  
      // Return the session URL for redirect
      return new Response(
        JSON.stringify({
          url: session.url,
          sessionId: session.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      
      // Extract meaningful error message from Stripe
      let errorMessage = "Unknown Stripe error";
      if (stripeError.message) {
        errorMessage = stripeError.message;
      } else if (stripeError.raw && stripeError.raw.message) {
        errorMessage = stripeError.raw.message;
      }
      
      // Provide a more descriptive error
      throw new Error(`Stripe API error: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error("Error creating topped session:", error);
    
    // Meaningful error codes for the frontend
    let errorCode = "topped_session_creation_failed";
    let status = 500;
    
    if (error.message.includes("API key")) {
      errorCode = "stripe_api_key_invalid";
      status = 401;
    } else if (error.message.includes("not authenticated")) {
      errorCode = "user_not_authenticated";
      status = 401;
    } else if (error.message.includes("profile not found")) {
      errorCode = "craftsman_profile_not_found";
      status = 404;
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        errorCode: errorCode
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: status,
      }
    );
  }
});
