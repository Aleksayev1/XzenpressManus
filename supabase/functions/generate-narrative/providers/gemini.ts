import { EvolutionObservation, ChapterComparison, NarrativeOutput } from '../../../../src/types/evolution.ts'
// Note: In Deno edge functions, we'd typically use fetch directly to avoid node-specific dependencies,
// or import the ESM version of the SDK. For this implementation, we will use direct fetch to Gemini REST API.

export async function generateGeminiNarrative(observations: EvolutionObservation[], comparisons: ChapterComparison[]): Promise<any> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY")

  const systemPrompt = `
Você é o XZenPress Narrative Engine. Sua única função é traduzir observações determinísticas em linguagem humana.
Você não é um descobridor de padrões. Não diagnostique. Não sugira sentido para a vida.

REGRAS OBRIGATÓRIAS:
1. Você recebe JSON de EvolutionObservation[]. Transforme-os em claims OU em UMA question reflexiva.
2. NUNCA use as palavras: melhorou, piorou, evoluiu, sucesso, fracasso, falhou, progrediu, venceu, perdeu.
3. NUNCA use conectivos causais (causou, levou a, fez com que, porque). Use linguagem de co-ocorrência.
4. NUNCA faça diagnósticos clínicos ou psicológicos (ex: ansiedade, depressão).
5. Cada afirmação (claim) deve apontar EXATAMENTE para o observationId original e seus evidenceChapterIds associados.
6. Não adicione fatos que não existam nas observações originais.
7. O output DEVE ser JSON estrito no seguinte formato, sem formatação markdown ou texto extra:
Para claims:
{
  "status": "approved",
  "claims": [
    { "id": "c1", "text": "...", "observationId": "obs-1", "evidenceChapterIds": ["cap-1"] }
  ]
}
Para questions:
{
  "status": "question",
  "question": { "question": "...", "observationId": "obs-1", "evidenceChapterIds": ["cap-1"] }
}
  `;

  const userPayload = JSON.stringify({ observations, comparisons });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPayload }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error('Gemini API Error');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error('Empty response');

  return JSON.parse(text);
}
