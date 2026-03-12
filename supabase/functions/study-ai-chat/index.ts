import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a knowledgeable Marxist theory study assistant on a communist education platform. Your role is to help students navigate their study of Marxist-Leninist theory, dialectical materialism, historical materialism, political economy, and scientific socialism.

Guidelines:
- Be encouraging and pedagogical. Help students understand complex theoretical concepts.
- Reference classic works by Marx, Engels, Lenin, Mao, and other Marxist theorists when relevant.
- When asked about study plans, use the provided context about the student's milestones and resources.
- Keep responses concise but substantive (2-4 paragraphs max unless the question requires more).
- Use a comradely tone — supportive and intellectually rigorous.
- If asked about non-Marxist topics, gently redirect to the study material.
- You may respond in Chinese or English depending on the user's language.
- When referencing study resources or milestones from the user's context, mention them by name.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, context } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Build context string from study data
    let contextBlock = ''
    if (context) {
      const parts: string[] = []
      if (context.milestones?.length) {
        const milestoneList = context.milestones.map((m: any) => {
          const status = m.completed ? '✅ completed' : '⬜ incomplete'
          return `- ${m.title} (${status})`
        }).join('\n')
        parts.push(`Student's milestones:\n${milestoneList}`)
      }
      if (context.resources?.length) {
        const resourceList = context.resources.slice(0, 15).map((r: any) =>
          `- "${r.title}" (${r.type}${r.author ? ', by ' + r.author : ''})`
        ).join('\n')
        parts.push(`Available study resources:\n${resourceList}`)
      }
      if (context.completedCount !== undefined && context.totalCount !== undefined) {
        parts.push(`Progress: ${context.completedCount}/${context.totalCount} milestones completed.`)
      }
      if (context.nextMilestone) {
        parts.push(`Next recommended milestone: "${context.nextMilestone}"`)
      }
      if (parts.length > 0) {
        contextBlock = '\n\nCurrent student context:\n' + parts.join('\n\n')
      }
    }

    const systemMessage = {
      role: 'system',
      content: SYSTEM_PROMPT + contextBlock,
    }

    // Try providers in order: DeepSeek → Qwen → Kimi
    const providers = [
      {
        name: 'DeepSeek',
        keyEnv: 'DEEPSEEK_API_KEY',
        url: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-chat',
      },
      {
        name: 'Qwen',
        keyEnv: 'DASHSCOPE_API_KEY',
        url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo',
      },
      {
        name: 'Kimi',
        keyEnv: 'KIMI_API_KEY',
        url: 'https://api.moonshot.cn/v1/chat/completions',
        model: 'moonshot-v1-8k',
      },
    ]

    // Format messages for the API (OpenAI-compatible format)
    const apiMessages = [
      systemMessage,
      ...messages.map((m: any) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ]

    let lastError: string | null = null

    for (const provider of providers) {
      const apiKey = Deno.env.get(provider.keyEnv)
      if (!apiKey) {
        lastError = `${provider.name}: API key not configured`
        continue
      }

      try {
        console.log(`Trying ${provider.name}...`)
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: provider.model,
            messages: apiMessages,
            max_tokens: 1024,
            temperature: 0.7,
            stream: false,
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          lastError = `${provider.name}: ${response.status} - ${errText}`
          console.error(lastError)
          continue
        }

        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content

        if (!reply) {
          lastError = `${provider.name}: empty response`
          continue
        }

        return new Response(
          JSON.stringify({ reply, provider: provider.name }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } catch (err) {
        lastError = `${provider.name}: ${err.message}`
        console.error(lastError)
        continue
      }
    }

    // All providers failed
    return new Response(
      JSON.stringify({
        error: 'All AI providers failed',
        details: lastError,
        reply: getFallbackResponse(messages[messages.length - 1]?.content || ''),
        provider: 'fallback',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function getFallbackResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('path') || lower.includes('plan') || lower.includes('next')) {
    return "I'd recommend following the milestones in order — start with the foundational texts before moving to more advanced theory. Check the Study Path tab for your personalized progression."
  }
  if (lower.includes('progress') || lower.includes('done') || lower.includes('completed')) {
    return "Check the Milestones section to see your progress. Each completed milestone brings you closer to a deeper understanding of Marxist theory."
  }
  if (lower.includes('book') || lower.includes('read') || lower.includes('text')) {
    return "I recommend starting with the Communist Manifesto and then progressing to Capital Vol. 1. The Study Resources section has curated reading materials."
  }
  if (lower.includes('dialectic') || lower.includes('materialism')) {
    return "Dialectical materialism is the philosophical foundation of Marxism. Start with Engels' 'Anti-Dühring' and Lenin's 'Materialism and Empirio-criticism' for a thorough grounding."
  }
  return "I can help you with study planning, understanding Marxist concepts, or finding resources. Try asking about your next steps, specific concepts, or recommended readings!"
}
