
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

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
      throw new Error("Craftsman profile not found");
    }

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
      success_url: `${req.headers.get("origin")}/profile/${user.id}?topped=success`,
      cancel_url: `${req.headers.get("origin")}/profile/${user.id}?topped=canceled`,
      client_reference_id: user.id,
      metadata: {
        craftsman_id: user.id,
        topped_days: days,
        topped_until: endDate.toISOString(),
      },
    });

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
    }

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
  } catch (error) {
    console.error("Error creating topped session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
