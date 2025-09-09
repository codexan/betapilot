import OpenAI from "openai";


interface EmailGenerationRequest {
  campaignName: string;
  availableSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  companyName: string;
  recipientCount: number;
  customInstructions?: string;
}

// Deno.serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 204,
//       headers: {
//         "Access-Control-Allow-Origin": "*", // or your frontend domain
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization"
//       }
//     });
//   }

//   // console.log('Request headers:', req.headers);
//   // console.log('Request method:', req.method);
//   // console.log('Request body:', await req.text());
  
//   try {
//     const { campaignName, availableSlots, companyName, recipientCount, customInstructions } = await req.json() as EmailGenerationRequest;

//     const openai = new OpenAI({
//       apiKey: Deno.env.get("OPENAI_API_KEY"),
//     });

//     // Format slots for AI
//     const slotsByDate = availableSlots?.reduce((acc: any, slot: any) => {
//       if (!acc[slot.date]) acc[slot.date] = [];
//       acc[slot.date].push(`${slot.startTime} - ${slot.endTime}`);
//       return acc;
//     }, {});

//     const slotsSummary = Object.entries(slotsByDate || {})
//       .map(([date, times]) => {
//         const formattedDate = new Date(date).toLocaleDateString("en-US", {
//           weekday: "long",
//           month: "long",
//           day: "numeric",
//         });
//         return `${formattedDate}: ${(times as string[]).join(", ")}`;
//       })
//       .join("\n");

//     const prompt = `Generate a professional scheduling email for a beta testing campaign with these details:

// CAMPAIGN DETAILS:
// - Campaign Name: ${campaignName}
// - Company: ${companyName}
// - Recipients: ${recipientCount} beta testers who have already been invited
// - Available Time Slots:
// ${slotsSummary}

// EMAIL REQUIREMENTS:
// 1. Subject line should be engaging and mention scheduling/booking
// 2. Thank recipients for accepting the beta invitation
// 3. Explain that they can now book their testing session
// 4. List the available time slots clearly
// 5. Include a clear call-to-action to book their slot
// 6. Mention that slots are first-come, first-served
// 7. Include contact information for questions
// 8. Keep tone professional but friendly
// 9. Use HTML formatting for better readability

// ${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ''}

// Generate the email with proper HTML structure, including headers, paragraphs, and a clear layout for the time slots.`;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an expert email copywriter specializing in beta testing and user research communications.",
//         },
//         { role: "user", content: prompt },
//       ],
//       response_format: {
//         type: "json_schema",
//         json_schema: {
//           name: "scheduling_email_response",
//           schema: {
//             type: "object",
//             properties: {
//               subject: { type: "string" },
//               content: { type: "string" },
//               preview_text: { type: "string" },
//               call_to_action: { type: "string" },
//             },
//             required: ["subject", "content", "preview_text", "call_to_action"],
//           },
//         },
//       },
//     });

//     return new Response(
//       JSON.stringify(JSON.parse(response.choices[0].message.content || "{}")),
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "Access-Control-Allow-Origin": "*", // or your frontend domain
//           "Access-Control-Allow-Methods": "POST, OPTIONS",
//           "Access-Control-Allow-Headers": "Content-Type, Authorization"
//         }
//       }
//     );
    
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: "Failed to generate email" }), {
//       status: 500,
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization"
//       }
//     });
    
//   }
// });

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

  if (req.method === "POST") {
    try {
      const { campaignName, availableSlots, companyName, recipientCount, customInstructions } =
        await req.json() as EmailGenerationRequest;

      const openai = new OpenAI({
        apiKey: Deno.env.get("OPENAI_API_KEY"),
      });

      // Format slots for AI
      const slotsByDate = availableSlots?.reduce((acc: any, slot: any) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(`${slot.startTime} - ${slot.endTime}`);
        return acc;
      }, {});

      const slotsSummary = Object.entries(slotsByDate || {})
        .map(([date, times]) => {
          const formattedDate = new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });
          return `${formattedDate}: ${(times as string[]).join(", ")}`;
        })
        .join("\n");

      const prompt = `Generate a professional scheduling email for a beta testing campaign with these details:

CAMPAIGN DETAILS:
- Campaign Name: ${campaignName}
- Company: ${companyName}
- Recipients: ${recipientCount} beta testers who have already been invited
- Available Time Slots:
${slotsSummary}

EMAIL REQUIREMENTS:
1. Subject line should be engaging and mention scheduling/booking
2. Thank recipients for accepting the beta invitation
3. Explain that they can now book their testing session
4. List the available time slots clearly
5. Include a clear call-to-action to book their slot
6. Mention that slots are first-come, first-served
7. Include contact information for questions
8. Keep tone professional but friendly
9. Use HTML formatting for better readability

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ''}

Generate the email with proper HTML structure, including headers, paragraphs, and a clear layout for the time slots.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert email copywriter specializing in beta testing and user research communications.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "scheduling_email_response",
            schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                content: { type: "string" },
                preview_text: { type: "string" },
                call_to_action: { type: "string" },
              },
              required: ["subject", "content", "preview_text", "call_to_action"],
            },
          },
        },
      });

      return new Response(
        JSON.stringify(JSON.parse(response.choices[0].message.content || "{}")),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        }
      );
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: "Failed to generate email" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
  }

  // Fallback for unsupported methods
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
});
