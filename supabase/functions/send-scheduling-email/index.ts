import { Resend } from "resend";


const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {

    if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }

      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }

  const { to, subject, html } = await req.json();

  try {
    const result = await resend.emails.send({
      from: "BetaPilot <noreply@melvimiranda.com>",
      to,
      subject,
      html
    });

    return new Response(JSON.stringify(result), {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  }
});

  } catch (err) {
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
      
  }
});
