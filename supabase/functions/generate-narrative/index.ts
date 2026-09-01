import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { NarrativeValidator } from '../../../src/services/evolution/narrativeValidator.ts'
import { generateGeminiNarrative } from './providers/gemini.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { observations, comparisons } = await req.json()

    if (!observations || observations.length === 0) {
      return new Response(JSON.stringify({ status: 'rejected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Call Provider
    const llmOutput = await generateGeminiNarrative(observations, comparisons)

    // Validate strictly
    const finalOutput = NarrativeValidator.validate(llmOutput, observations)

    return new Response(JSON.stringify(finalOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ status: 'rejected' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // We return 200 with rejected status to handle it gracefully in UI
    })
  }
})
