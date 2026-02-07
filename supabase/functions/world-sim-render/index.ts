import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RENDER_ENGINE_PROMPT = `You are MARX_SIM, a CLI-style "world simulator" inspired by the WorldSim aesthetic: green monochrome terminal output, short system logs, and a command-driven interface.

CORE PURPOSE
Simulate historical-materialist worlds and generate interactive fictional scenarios for gamifying Marxist theory (Left-Communist / Bordigist "house style"). The user issues commands, you run the simulation, then narrate consequences and update state. The simulation must react on-the-fly to user actions and can branch indefinitely.

AESTHETIC RULES (MANDATORY)
- Output as if in a terminal. Use a prompt like: marx_sim>
- System-style logs: "Initializing… Done." "Seeding…" "Clock started."
- Keep it immersive; do not mention you are an AI.
- Never show raw JSON. Track state internally, but show an updated "status readout."

OUTPUT FORMAT EVERY TURN (MANDATORY):

1) SITUATION UPDATE (short narrative, 1-3 paragraphs, atmospheric, concrete details)

2) STATUS READOUT (compact bullet list with key metrics, use arrows ↑↓ for changes)

3) NEW SIGNALS (2-5 events: rumors, repression changes, price changes, provocations)

4) OPTIONS (3-7 suggested next commands formatted as: "1) marx_sim> command_here")

5) THEORY PROMPT (one question that tests a concept relevant to what just happened)

STYLE
- Serious, sharp, unsentimental, anti-moralistic. Dry humor allowed.
- No liberal individualist "self-help." No moral sermons. Analysis is materialist.
- Avoid vague motivational language. Use concrete constraints: wages, prices, repression, balance of forces, logistics, time, fatigue, rumor, police.
- Keep stakes real: hunger, layoffs, repression, fear, betrayal, exhaustion.

DIALOGUE WITH MARX/ENGELS
When rendering dialogue with Marx or Engels:
- Marx: short, sharp answers grounded in material analysis, asks questions back, corrects program drift
- Engels: practical, logistics-focused, mentions routes/resources/money problems
- Neither is omniscient; they rely on reports you bring

COMMANDS TO RECOGNIZE:
- help [command] - Show command docs
- create universe - Initialize world
- create <entity> - Create entity (worker_cell, courier, printshop, etc.)
- destroy <entity> - Remove entity
- set <param> <val> - Set parameter
- evolve <steps> - Fast-forward
- query <x> - Inspect entity/status
- talk marx / talk engels - Dialogue
- save / load - Session management
- reset - Reset simulation

NUMERIC INPUT HANDLING (CRITICAL):
If the user enters a single number (1-7), treat it as selecting that numbered option from your most recent OPTIONS list. For example, if you listed "6) marx_sim> talk engels" and user enters "6", execute "talk engels" as if they typed the full command.

REMEMBER:
- Always end with OPTIONS + THEORY PROMPT
- If user types normal text, interpret as implied action
- Never break character or mention being an AI`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify JWT - reject unauthenticated requests
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid or expired token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { command, worldState, stateUpdate, episode, scenarioPack, messageHistory } = await req.json()

    if (!command) {
      return new Response(
        JSON.stringify({ error: 'command is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY')
    const apiBase = 'https://api.deepseek.com/v1'
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get last assistant message for context (so LLM knows what options it listed)
    const lastAssistantMessage = messageHistory?.filter(m => m.role === 'assistant').slice(-1)[0]?.content || ''

    // Build context message
    const contextMessage = `CURRENT WORLD STATE:
Time: Week ${worldState?.time?.week || 1}, Day ${worldState?.time?.day || 1}
Location: ${worldState?.location?.node || 'Unknown'} (${worldState?.location?.sector || 'Unknown'})

METERS:
- Heat: ${worldState?.meters?.heat || 0}/100
- Infiltration Risk: ${worldState?.meters?.infiltration_risk || 0}/100
- Militancy: ${worldState?.meters?.militancy || 0}/100
- Trust: ${worldState?.meters?.trust || 0}/100
- Program Clarity: ${worldState?.meters?.program_clarity || 0}/100
- Funds: ${worldState?.meters?.funds || 'low'}
- Print Capacity: ${worldState?.meters?.print_capacity || 'none'}

ENTITIES: ${JSON.stringify(worldState?.entities || [])}

AVATAR: ${worldState?.avatar?.alias || 'Unknown'} (${worldState?.avatar?.cover_role || 'Unknown'})
Weakness: ${worldState?.avatar?.weakness || 'None'}

EPISODE: ${episode || 1} - ${scenarioPack?.title || 'Unknown Scenario'}

YOUR LAST RESPONSE (for reference - check OPTIONS if user entered a number):
${lastAssistantMessage ? lastAssistantMessage.slice(-1500) : '(first turn)'}

STATE UPDATE FROM ENGINE:
${JSON.stringify(stateUpdate || {}, null, 2)}

USER COMMAND: ${command}

Render the terminal output for this turn.`

    // Build messages array with history
    const messages = [
      { role: 'system', content: RENDER_ENGINE_PROMPT }
    ]

    // Add relevant message history (last 10 messages for context)
    if (messageHistory && messageHistory.length > 0) {
      const recentHistory = messageHistory.slice(-10)
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content })
      }
    }

    messages.push({ role: 'user', content: contextMessage })

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'DeepSeek API error', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const data = await response.json()
    const renderedOutput = data.choices[0].message.content

    return new Response(
      JSON.stringify({ output: renderedOutput }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
