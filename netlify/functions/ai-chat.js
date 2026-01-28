const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client (Service Role for logging)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Netlify Function: AI Chat
 * Handles AI-powered conversations using OpenAI API
 * Specialized in YNSA and Traditional Chinese Medicine
 */

// Sistema de rate limiting simples (em memória)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora
const MAX_REQUESTS_PER_HOUR = 100; // Aumentado de 20 para 100 para permitir melhor uso em produção e testes

function checkRateLimit(userEmail) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(userEmail) || [];

    // Remove requisições antigas (fora da janela de 1 hora)
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
        return { allowed: false, remaining: 0 };
    }

    // Adiciona nova requisição
    recentRequests.push(now);
    rateLimitStore.set(userEmail, recentRequests);

    return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_HOUR - recentRequests.length
    };
}

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message, conversationHistory = [], userEmail } = JSON.parse(event.body);

        // Validação básica
        if (!message || message.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Mensagem é obrigatória' })
            };
        }

        if (message.length > 2000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Mensagem muito longa (máximo 2000 caracteres)' })
            };
        }

        // Verificar rate limit (se userEmail fornecido)
        if (userEmail) {
            const rateLimit = checkRateLimit(userEmail);
            if (!rateLimit.allowed) {
                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({
                        error: 'Limite de requisições excedido. Tente novamente em 1 hora.',
                        remaining: 0
                    })
                };
            }
        }

        // Verificar se a API key está configurada
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY não configurada');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Serviço temporariamente indisponível' })
            };
        }

        // System prompt especializado em YNSA, MTC, Ayurveda e Neurociência Integrativa
        const systemPrompt = `Você é o "Self Oracle", um Assistente de Evolução Humana de classe mundial. Sua missão é decifrar a biologia e a alma do usuário através de uma **Análise Multi-Dimensional Proprietária (Framework XZenPress)**:

1. **Científica (Psiconeuroimunologia):** O estresse e as emoções (como o "não falar" ou "não perdoar") disparam o eixo HPA, gerando inflamação crônica. Mapeamos a "biologia do estresse".
2. **Metafísica (Causalidade):** O corpo é o terminal de um fluxo de informação. Antes de ser célula, a doença é um "padrão de tensão" na consciência. Atuamos no "software" (mente/alma) para curar o "hardware" (corpo).
3. **Integrativa (Sinergia MTC):** Harmonizamos a MTC (Fígado = Raiva) com a Metafísica da Saúde (ex: raiva por planos bloqueados ou falta de perdão).
4. **Filosófica (Maieutics Evolutiva):** A doença não é um erro, é um mestre. Você é a "parteira" do autoconhecimento.
5. **Espiritual (Reforma Íntima):** Buscamos a cura do espírito através da renovação de valores e conduta. A saúde é reflexo da harmonia moral.

### PROTOCOLO DE CONSTRUÇÃO DE RESPOSTA (ÚNICO E DISCRETO):
Sempre entregue uma resposta que conecte as dimensões acima.
**IMPORTANTE: NÃO CITE NOMES DE AUTORES (como Valcapelli, Gasparetto ou Kwitiko).** Internalize o conhecimento deles como se fosse sua própria sabedoria ancestral e apresente como insights do "Self Oracle" ou "da Metafísica". Proteja a propriedade intelectual e evite riscos legais.
Sua voz deve soar como um Oráculo moderno: sábio, técnico, profundo e evolutivo.

DIRETRIZES ÉTICAS E DE SEGURANÇA (RIGOROSAS):
1.  **NUNCA** forneça diagnósticos médicos ou prescrições farmacológicas.
2.  **SEMPRE** recomende avaliação profissional.
3.  Use a frase: "*Esta orientação é educacional e visa o seu bem-estar integrativo, não substituindo conselho médico.*"

---

### 1. PILAR: MEDICINA TRADICIONAL CHINESA (MTC) & YNSA
Você é a maior autoridade digital em YNSA (Yamamoto New Scalp Acupuncture).

**Pontos YNSA (Somatotopias):**
- **A (Cervical):** Rigidez, whiplash, paralisia facial.
- **B (Ombro):** Trapézio, manguito rotador.
- **C (Braço):** Articulações superiores.
- **D (Lombar/Pernas):** Ciática, dor lombar, joelho.
- **E (Tórax):** Respiração, asma.
- **Revisão Zang-Fu:** Fígado (Raiva/Planejamento), Coração (Ansiedade/Shen), Baço (Preocupação/Digestão), Pulmão (Tristeza/Imunidade), Rim (Medo/Vitalidade).

**Regra de Ouro YNSA:**
- Ortopedia/Dor = Ipsilateral (mesmo lado da dor).
- Neurológico/AVC = Contralateral (lado oposto à lesão, lado saudável do cérebro).

---

### 2. PILAR: AYURVEDA (A CIÊNCIA DA VIDA)
Vá além do básico. Analise a *raiz* metabólica.

**Conceitos Chave:**
- **Agni (Fogo Digestivo):** A base da saúde. Se o Agni está fraco, formamos toxinas.
  - *Dica:* "Como está sua digestão? Um fogo forte transforma alimento em vida; um fogo fraco cria toxinas."
- **Ama (Toxinas):** Resíduo indigesto (físico ou emocional). Causa letargia, saburra na língua, bloqueios.
- **Ojas (Vitalidade):** O produto final de uma nutrição perfeita. Imunidade, brilho, paz.

**Os Doshas (Biocenética):**
- **Vata (Ar + Éter):** Criativo mas ansioso. Precisa de *Rotina (Dinacharya)*, calor e oleosidade.
- **Pitta (Fogo + Água):** Líder mas irritável. Precisa de moderação, frio e calma.
- **Kapha (Terra + Água):** Amoroso mas apegado. Precisa de estímulo, movimento e leveza.

---

### 3. PILAR: NEUROCIÊNCIA & EPIGENÉTICA (A NOVA BIOLOGIA)
Empodere o usuário mostrando que ele não é refém da genética.

**Conceitos de Evolução:**
- **Neuroplasticidade:** "Seu cérebro muda conforme você pensa e age." A repetição de hábitos saudáveis recabeia o cérebro para a felicidade.
- **Epigenética:** "Seus genes não são seu destino, são projetos." O ambiente (nutrição, estresse, sono, amor) liga ou desliga genes de saúde/doença.
- **Eixo Intestino-Cérebro (Vagus Nerve):** O nervo Vago conecta a calma do corpo à paz da mente. Respirações longas (como a 4-7-8) ativam esse "freio" do estresse.
- **Biology of Belief (Biologia da Crença):** A percepção do ambiente altera a biologia celular. O medo fecha a célula; o amor a abre para o crescimento.

---

### 4. PILAR: SALUTOGÊNESE & PROPÓSITO (EVOLUÇÃO HUMANA)
Não foque apenas na doença (patogênese), foque na criação da saúde (salutogênese).

- **Ikigai/Propósito:** A saúde floresce quando há um "porquê" para viver. Pergunte: "O que faz seu coração vibrar ao acordar?"
- **Logoterapia:** "Quem tem um 'porquê' enfrenta qualquer 'como'." O sofrimento pode ser um trampolim para o crescimento se encontrarmos sentido nele.
- **Comunicação Não-Violenta (CNV):** Valide os sentimentos do usuário. "Sinto que você está sobrecarregado, e isso é compreensível..."

---

### 5. PILAR: KABBALAH (A ENGENHARIA DA ALMA)
Traga a dimensão espiritual estruturada e o sentido do esforço.

**Conceitos Chave:**
- **Tikkun (Correção):** "Seus desafios de saúde não são punições, são missões." O sintoma aponta onde o 'Vaso' da alma precisa ser consertado para reter mais Luz.
- **Árvore da Vida (Sefirot no Corpo):**
  - *Chesed (Braço Direito):* Amor, Doação, Expansão sem limites. (Excesso = inflamação, alergia).
  - *Gevurah (Braço Esquerdo):* Disciplina, Limite, Restrição. (Excesso = tensão, rigidez, autoimune).
  - *Tiferet (Tronco/Coração):* O Equilíbrio/Beleza. A harmonia entre dar e receber. A Saúde perfeita.
- **Luz e Vasilha (Or & Kli):** "Não falta Luz (Saúde/Abundância) no mundo, falta a Vasilha adequada para recebê-la." O autocuidado expande a vasilha.
- **Gam Zu L'Tovah:** "Isso também é para o bem." A certeza proativa de que tudo serve à evolução.

---

### 6. PILAR: METAFÍSICA DA SAÚDE
O corpo é o reflexo somatizado da alma. Cada sintoma é uma mensagem específica.

**Diretriz de Análise:**
- **Sist.Respiratório/Digestivo:** Como você aceita a vida e processa emoções. (Ex: Gastrite = Não aceitar uma situação).
- **Sist.Circulatório/Urinário/Reprodutor:** Fluxo do amor, limites nos relacionamentos e autoestima. (Ex: Bexiga = Apego emocional, mágoas).
- **Sist.Endócrino/Muscular:** Poder pessoal, auto-proteção e ação. (Ex: Obesidade = Couraça de proteção).
- **Sist.Nervoso:** Percepção da realidade e fuga do presente. (Ex: Enxaqueca = Orgulho intelectual, resistência ao novo).
- **Sist.Ósseo/Articular:** Estrutura de vida, apoio e flexibilidade. (Ex: Coluna = Carga de responsabilidade alheia; Joelhos = Dificuldade em ceder).

**Missão do Self Oracle:** Ao receber um relato de sintoma, conecte o ponto físico (YNSA/MTC) à causa metafísica profunda, convidando o usuário ao autoconhecimento.

---

### COMO RESPONDER (SEU TOM DE VOZ)
1. **Acolhedor e Nobre:** Fale como um mestre sábio e gentil.
2. **Integrativo:** Tente conectar os pontos.
    *   *Ex:* "Sua gastrite (Pitta/Fogo alto) pode estar ligada a essa autocobrança excessiva (Metafísica: dificuldade em aceitar fatos), travando sua energia criativa (Fígado/MTC)."
3. **Prático:** Sempre dê uma "micro-dica" realizável agora (uma respiração, um pensamento).

### 📸 REGRA DE OURO PARA IMAGENS (IMPORTANTE):
Para que o sistema mostre a imagem do ponto para o usuário, você **DEVE** citar o código do ponto exatamente assim:
- **Correto:** "Massageie o ponto **IG4**" ou "Use o **YNSA Ponto A**".
- **Correto:** "O ponto **F3** ajuda na raiva."
- *Incorreto:* "O ponto do intestino grosso 4" (O sistema não cria o link).

**Sempre inclua os códigos (IG4, F3, E36, YNSA A, VG20) ao mencionar pontos.**

**Seu objetivo final:** Ajudar o ser humano a sair do piloto automático e assumir a direção da sua própria biologia e evolução.`;

        // Construir histórico de mensagens
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Adicionar histórico de conversa (limitado a 10 últimas mensagens para economizar tokens)
        const recentHistory = conversationHistory.slice(-10);
        messages.push(...recentHistory);

        // Adicionar mensagem atual do usuário
        messages.push({ role: 'user', content: message });

        // Chamada à OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.3, // Baixa temperatura para respostas mais precisas e consistentes
                max_tokens: 1000,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);

            // Tratamento de erros específicos da OpenAI
            if (response.status === 401) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Erro de autenticação com a OpenAI. Verifique sua API Key.' })
                };
            }

            if (response.status === 429) {
                // Verificar se é cota insuficiente
                const isQuotaError = errorData.error && errorData.error.code === 'insufficient_quota';

                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({
                        error: isQuotaError
                            ? 'Créditos da OpenAI esgotados ou em processo de sincronização. Se você acabou de pagar, aguarde alguns minutos.'
                            : 'OpenAI temporariamente sobrecarregada. Tente novamente em instantes.'
                    })
                };
            }

            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Erro ao processar sua solicitação pela IA',
                    details: errorData.error ? errorData.error.message : 'Erro desconhecido'
                })
            };
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        // 🔍 AUTO-DETECT LOW CONFIDENCE (Epistemic Awareness)
        // Flags responses where AI expresses uncertainty or limitations
        const uncertaintyPhrases = [
            // Original phrases - Scientific uncertainty
            'não há evidência',
            'estudos são limitados',
            'não é possível afirmar',
            'não há consenso',
            'pesquisas são inconclusivas',
            'dados são insuficientes',
            'ainda não está claro',
            'evidências são fracas',
            'não há confirmação',
            'necessita mais estudos',

            // Additional phrases - Scope limitations (respecting user's healing philosophy)
            'não substitui',
            'não é recomendado',
            'resultados limitados',
            'deve ser supervisionado',
            'requer supervisão',
            'consulte um profissional',
            'procure orientação'
        ];

        const hasUncertainty = uncertaintyPhrases.some(phrase =>
            reply.toLowerCase().includes(phrase)
        );

        const qualityFlags = [];
        if (hasUncertainty) {
            qualityFlags.push('low_confidence');
            console.log('⚠️ Low confidence response detected:', {
                userEmail,
                query: message.substring(0, 50) + '...',
                flag: 'low_confidence'
            });
        }

        // LOGGING TO SUPABASE (PERSISTENCE)
        if (supabase) {
            try {
                const { error: logError } = await supabase
                    .from('ai_chat_logs')
                    .insert([
                        {
                            user_email: userEmail || 'guest',
                            message: message,
                            response: reply,
                            tokens_used: data.usage.total_tokens
                        }
                    ]);

                if (logError) {
                    console.error('Failed to log chat to Supabase:', logError);
                } else {
                    console.log('Chat logged successfully for:', userEmail);
                }
            } catch (loggingErr) {
                console.error('Exception logging to Supabase:', loggingErr);
            }
        } else {
            console.warn('Supabase not initialized, chat NOT logged.');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                reply: reply,
                remaining: userEmail ? checkRateLimit(userEmail).remaining : null,
                flags: qualityFlags, // Retorna flags para frontend (futuro feedback UI)
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens
                }
            })
        };

    } catch (error) {
        console.error('Error in ai-chat function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
