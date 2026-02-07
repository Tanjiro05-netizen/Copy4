import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, notify_invite_codes, notify_public_beta } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert into waitlist
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert({
        email,
        notify_invite_codes: notify_invite_codes ?? true,
        notify_public_beta: notify_public_beta ?? true,
      })

    if (dbError) {
      if (dbError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'This email is already on the list' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw dbError
    }

    // Send confirmation email via Resend
    if (RESEND_API_KEY) {
      const notifyItems: string[] = []
      if (notify_invite_codes !== false) notifyItems.push('<li>When invite codes become available</li>')
      if (notify_public_beta !== false) notifyItems.push('<li>When public beta launches</li>')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Marxist.info <onboarding@resend.dev>',
          to: [email],
          subject: 'Welcome to the Marxist.info Waitlist',
          html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 40px; border-radius: 12px;">
  <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 8px;">Marxist.info</h1>
  <p style="color: #9ca3af; font-size: 14px; margin-bottom: 32px;">Advancing Revolutionary Theory</p>

  <h2 style="color: #ffffff; font-size: 20px;">You're on the list!</h2>
  <p style="color: #d1d5db; line-height: 1.6;">
    Thank you for your interest in Marxist.info. You've been added to our notification list and we'll keep you updated.
  </p>

  ${notifyItems.length > 0 ? `
  <div style="background: #2d2d44; border-radius: 8px; padding: 20px; margin: 24px 0;">
    <p style="color: #d1d5db; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">We'll notify you:</p>
    <ul style="color: #9ca3af; font-size: 14px; padding-left: 20px; margin: 0;">
      ${notifyItems.join('')}
    </ul>
  </div>
  ` : ''}

  <p style="color: #d1d5db; line-height: 1.6;">
    In the meantime, feel free to browse the site as a guest at
    <a href="https://marxist.info" style="color: #dc2626; text-decoration: none;">marxist.info</a>.
  </p>

  <hr style="border: none; border-top: 1px solid #374151; margin: 32px 0;" />
  <p style="color: #6b7280; font-size: 12px; margin: 0;">
    Follow us on Twitter: <a href="https://x.com/Leninistwarrior" style="color: #9ca3af;">@Leninistwarrior</a><br/>
    Support the project: <a href="https://ko-fi.com/MarxistInfo" style="color: #9ca3af;">ko-fi.com/MarxistInfo</a>
  </p>
</div>
          `,
        }),
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Waitlist signup error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to process signup' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
