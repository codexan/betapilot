import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  try {
    const { token, calendar_slot_id, customer_id } = await req.json();

    const { data: tokenRow } = await supabase
      .from('public_access_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (!tokenRow || tokenRow.used || new Date(tokenRow.expires_at) < new Date()) {
      return new Response('Invalid or expired token', { status: 403 });
    }

    const { error } = await supabase
      .from('calendar_bookings')
      .insert({
        calendar_slot_id,
        customer_id,
        campaign_id: tokenRow.beta_program_id
      });

    if (error) {
      return new Response(JSON.stringify(error), { status: 500 });
    }

    await supabase
      .from('public_access_tokens')
      .update({ used: true })
      .eq('token', token);

    return new Response('Booking confirmed', { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
});
