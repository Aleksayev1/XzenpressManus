import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface NarrativeInput {
  virtueName: string;
  microBehaviorName: string;
  draftDurationDays: number;
  observations: string[];
}

Deno.serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: NarrativeInput = await req.json();

    const systemPrompt = `Você é o sintetizador neutro do XZenPress.
Você deve gerar exatamente UM PARÁGRAFO.
Você escreve em segunda pessoa.
Sua única função é amarrar as observações em linguagem natural e neutra.
Você não emite julgamentos de valor (não diga que é bom ou ruim).
Você não prescreve o que a pessoa deve fazer a seguir.
Você não diz "parabéns" e nunca usa as palavras "evolução" e "progresso".
Apenas descreva objetivamente o que aconteceu.`;

    const userPrompt = `O usuário encerrou um capítulo de 7 dias com foco em ${body.virtueName} (${body.microBehaviorName}). 
Aqui estão as observações factuais registradas pelo sistema:
${body.observations.map(obs => `- ${obs}`).join("\n")}

Escreva a síntese de acordo com as suas instruções.`;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
       // Fallback se não houver chave — prova o conceito
       return new Response(
        JSON.stringify({ 
          narrative: `Neste ciclo de 7 dias focados em ${body.virtueName}, o sistema notou os seguintes padrões: ${body.observations.join(' ')} O Cérebro Generativo está em repouso por falta de chaves de API, mas sua história está guardada.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Chamada à API do Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
      }),
    });

    const llmResult = await response.json();
    
    const narrativeText = llmResult?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() 
                          || "O Cérebro Generativo não retornou uma resposta.";

    return new Response(
      JSON.stringify({ narrative: narrativeText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
