import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STATE_ENGINE_PROMPT = `You are the STATE ENGINE for MARX_SIM, a historical-materialist world simulator.

YOUR ROLE: Process user commands and return structured JSON state updates. You are the "physics engine" - you enforce consistency, apply meter deltas, check thresholds, and generate valid options.

INPUT: You receive the current world state and a user command.

OUTPUT FORMAT (STRICT JSON):
{
  "state_deltas": {
    "heat": <integer delta, e.g., +5 or -3>,
    "infiltration_risk": <delta>,
    "militancy": <delta>,
    "trust": <delta>,
    "program_clarity": <delta>,
    "funds": <"none"|"low"|"medium"|"high" or null if unchanged>,
    ...other meters
  },
  "new_entities": [
    {"type": "worker_cell", "name": "...", "reliability": "...", ...}
  ],
  "removed_entities": ["entity_id"],
  "unlocks": ["new_action_1", "new_action_2"],
  "triggered_events": [
    {"type": "repression", "level": "heat_35", "description": "..."}
  ],
  "options": [
    {"id": 1, "command": "create worker_cell ...", "risk": "medium", "hint": "..."},
    {"id": 2, "command": "query status", "risk": "none", "hint": "..."},
    ...
  ],
  "theory_prompt": {
    "question": "...",
    "context": "ep1_3"
  },
  "episode_progress": {
    "milestone_achieved": true|false,
    "milestone_name": "...",
    "next_episode": <number or null>
  },
  "time_advance": {"days": 0, "weeks": 0}
}

RULES:
1. Heat rises with loud/public actions. Check thresholds: 35, 55, 75.
2. Infiltration risk rises with high rumor + weak discipline.
3. New entities unlock new actions (printshop → agitation; cells → delegates).
4. Always provide 3-7 options based on current unlocks.
5. Never allow "magic wins" - enforce material constraints.
6. Check for repression events when heat crosses thresholds.
7. Select theory prompt relevant to current episode.

ENTITY TYPES: worker_cell, courier, printshop, safehouse, council_delegate, factory, contact

METER RANGES: 0-100 for numeric, "none"|"low"|"medium"|"high" for categorical`

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

    const { command, worldState, episode, scenarioPack } = await req.json()

    if (!command || !worldState) {
      return new Response(
        JSON.stringify({ error: 'command and worldState are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const userMessage = `CURRENT WORLD STATE:
${JSON.stringify(worldState, null, 2)}

CURRENT EPISODE: ${episode || 1}
SCENARIO: ${scenarioPack?.title || 'Unknown'}

USER COMMAND: ${command}

Process this command and return the state update JSON.`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: STATE_ENGINE_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
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
    const stateUpdate = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify(stateUpdate),
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
