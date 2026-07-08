import { Handler, HandlerEvent } from '@netlify/functions';
import fetch from 'node-fetch';

/**
 * Netlify Function: Process Onboarding Dialogue
 * Parses conversational anamnese transcripts into structured clinical JSON profiles.
 */
const { getCorsHeaders, isOriginAllowed } = require('./lib/cors');

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getCorsHeaders(event);

  if (!isOriginAllowed(event)) {
    return {
      statusCode: 403,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Origin not allowed' }),
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { transcript } = JSON.parse(event.body || '{}');

    if (!transcript || !Array.isArray(transcript)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid transcript' }),
      };
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key is missing' }),
      };
    }

    const systemPrompt = `
You are a medical AI parser that takes a transcription of a conversational clinical intake dialogue and parses it into a strict JSON format matching the schema rules.

REPRESENTATION SCHEMAS:
1. objetivoPrincipal (Must be exactly one of: 'reduzir_estresse', 'mais_energia', 'longevidade', 'equilibrio_emocional', 'melhorar_sono', 'fortalecer_imunidade')
2. qualidadeSono (Must be exactly one of: 'pessimo', 'ruim', 'regular', 'bom', 'otimo')
3. nivelEnergia (An integer between 0 and 100 representing general vitality/energy)
4. nivelEstresse (Must be exactly one of: 'muito_baixo', 'baixo', 'moderado', 'alto', 'critico')
5. nivelAtividade (Must be exactly one of: 'sedentario', 'leve', 'moderado', 'intenso')
6. padraoAlimentar (Must be exactly one of: 'processados', 'misto', 'natural', 'organico_integral')
7. sintomasFisicos (An array containing only valid strings from: 'acorda_noite', 'tensao_nuca', 'palpitacoes', 'digestao_lenta', 'inchaço', 'pele_ressecada', 'constipacao', 'respiracao_curta', 'dor_lombar', 'frio_extremidades', 'cansaco_cronico', 'dores_articulares')
8. emocoesDominantes (An array containing only valid strings from: 'raiva', 'ansiedade', 'preocupacao', 'tristeza', 'medo', 'paz', 'alegria', 'foco')
9. condicoesExistentes (An array containing only valid strings from: 'hipertensao', 'diabetes', 'ansiedade_diagnosticada', 'depressao_diagnosticada', 'problemas_digestivos', 'dores_cronicas', 'insonia_cronica', 'problemas_hormonais', 'nenhuma')
10. medicamentosEmUso (An array containing only valid strings from: 'anticoagulantes', 'antidepressivos', 'antihipertensivos', 'hipoglicemiantes', 'anticoncepcionais', 'nenhum')

INSTRUCTIONS:
- Analyze the user replies in the transcript carefully.
- Map the descriptive answers to the exact keywords above.
- Be clinically sound. If they report "dificuldade para dormir" or "insônia", map it to qualidadeSono: 'ruim' or 'pessimo', and add 'insonia_cronica' if relevant.
- If they report taking "remedio de pressao", map it to 'antihipertensivos'.
- Always return a valid JSON object.

Example output:
{
  "objetivoPrincipal": "reduzir_estresse",
  "qualidadeSono": "ruim",
  "nivelEnergia": 40,
  "nivelEstresse": "alto",
  "nivelAtividade": "sedentario",
  "padraoAlimentar": "misto",
  "sintomasFisicos": ["tensao_nuca", "cansaco_cronico"],
  "emocoesDominantes": ["ansiedade", "preocupacao"],
  "condicoesExistentes": ["ansiedade_diagnosticada"],
  "medicamentosEmUso": ["nenhum"]
}
`;

    const userContent = `Transcript:\n${transcript.map(m => `${m.role === 'assistant' ? 'ZenMentor' : 'User'}: ${m.content}`).join('\n')}`;

    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(`OpenAI API returned error: ${JSON.stringify(errorData)}`);
    }

    const apiData = await apiResponse.json();
    const parsedResult = JSON.parse(apiData.choices[0].message.content);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedResult),
    };
  } catch (error: any) {
    console.error('Onboarding parser error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process conversational onboarding',
        details: error.message,
      }),
    };
  }
};
