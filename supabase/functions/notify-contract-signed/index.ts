
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  contractorEmail: string;
  contractorName: string;
  projectName: string;
  documentName: string;
  clientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractorEmail, contractorName, projectName, documentName, clientName }: NotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "TrustLayer <onboarding@resend.dev>",
      to: [contractorEmail],
      subject: `Contract Signed: ${projectName}`,
      html: `
        <h1>Contract Signed!</h1>
        <p>Hi ${contractorName},</p>
        <p>Great news! ${clientName} has signed the contract "${documentName}" for the project "${projectName}".</p>
        <p>You can view the signed contract in your TrustLayer dashboard.</p>
        <p>Best regards,<br>The TrustLayer Team</p>
      `,
    });

    console.log("Contract signed notification sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-contract-signed function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
