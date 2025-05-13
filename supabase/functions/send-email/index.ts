
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@1.2.1";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Resend with API key from environment variable
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Define the request body interface
interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body: EmailRequest = await req.json();
    console.log("Received email request:", JSON.stringify(body, null, 2));
    
    // Validate the required fields
    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({ error: "Missing required email parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare email payload
    const emailPayload = {
      from: body.from || "Merito <onboarding@resend.dev>",
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
      reply_to: body.replyTo
    };
    
    console.log("Sending email with payload:", JSON.stringify(emailPayload, null, 2));
    
    // Send the email
    const { data, error } = await resend.emails.send(emailPayload);
    
    if (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Email sent successfully:", JSON.stringify(data, null, 2));
    
    // Return success response
    return new Response(
      JSON.stringify({ data, success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
