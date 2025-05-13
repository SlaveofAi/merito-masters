
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../../functions/_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
}

serve(async (req) => {
  console.log("Email sending request received");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body: EmailParams = await req.json();
    console.log("Email parameters:", JSON.stringify(body, null, 2));
    
    if (!body.to || !body.subject || !body.html) {
      console.error("Missing required email parameters");
      return new Response(
        JSON.stringify({ error: "Missing required email parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default from address if not provided
    const fromAddress = body.from || "Merito <no-reply@resend.dev>";

    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
      reply_to: body.replyTo
    });

    console.log("Email sent successfully:", emailResponse);
    
    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
