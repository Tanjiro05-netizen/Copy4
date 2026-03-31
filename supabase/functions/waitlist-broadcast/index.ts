import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { emailWrapper, broadcastEmailBody } from '../_shared/emailTemplate.ts'

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
    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Verify admin status using the caller's JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await createClient(
      SUPABASE_URL!,
      // Use anon key equivalent — we just need to verify the token
      Deno.env.get('SUPABASE_ANON_KEY') || SUPABASE_SERVICE_ROLE_KEY!
    ).auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin === true || profile?.role === 'admin'
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { subject, html_body } = await req.json()

    if (!subject || !html_body) {
      return new Response(
        JSON.stringify({ error: 'Subject and html_body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured (RESEND_API_KEY missing)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all waitlist subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('waitlist')
      .select('email')

    if (fetchError) throw fetchError

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No subscribers on the waitlist' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const html = emailWrapper(broadcastEmailBody(html_body))
    const emails = subscribers.map((s: { email: string }) => s.email)

    // Resend supports up to 100 recipients per batch.
    // Send in batches of 50 to stay well within limits.
    const BATCH_SIZE = 50
    let totalSent = 0
    const errors: string[] = []

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)

      const resendRes = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(
          batch.map((to: string) => ({
            from: 'Marxist.info <noreply@marxist.info>',
            to: [to],
            subject,
            html,
          }))
        ),
      })

      if (resendRes.ok) {
        totalSent += batch.length
      } else {
        const errBody = await resendRes.text()
        console.error(`Resend batch error (offset ${i}):`, resendRes.status, errBody)
        errors.push(`Batch ${i}-${i + batch.length}: ${resendRes.status}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_subscribers: emails.length,
        total_sent: totalSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Waitlist broadcast error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to send broadcast' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
