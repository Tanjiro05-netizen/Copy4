import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import nlp from 'https://esm.sh/compromise@14.11.0'

serve(async (req) => {
  // Extract text from the request body
  const { text } = await req.json()

  if (!text) {
    return new Response(
      JSON.stringify({ error: 'Missing text parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Process the text with compromise
  const doc = nlp(text)
  const people = doc.people().out('array')
  const places = doc.places().out('array')
  const organizations = doc.organizations().out('array')

  const entities = {
    people,
    places,
    organizations,
  }

  // Return the found entities as JSON
  return new Response(
    JSON.stringify(entities),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
