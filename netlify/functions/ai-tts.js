// Netlify Function: AI Text-to-Speech (TTS)
// Comunicação segura com a API da OpenAI utilizando o modelo tts-1

const { getCorsHeaders, isOriginAllowed } = require('./lib/cors');

exports.handler = async (event, context) => {
  // Cabeçalhos de CORS e resposta padrão
  const headers = getCorsHeaders(event);

  // Rejeitar origens não autorizadas
  if (!isOriginAllowed(event)) {
    return {
      statusCode: 403,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Origin not allowed' })
    };
  }

  // Tratar requisição OPTIONS (Preflight do CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  // Apenas aceita requisições POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const { text, voice = 'nova' } = JSON.parse(event.body);

    if (!text || text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'O texto é obrigatório' })
      };
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error('OPENAI_API_KEY não configurada nas variáveis de ambiente.');
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Configuração de chave de IA ausente no servidor.' })
      };
    }

    // Validação básica de vozes oficiais suportadas pela OpenAI
    const validVocalists = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const chosenVoice = validVocalists.includes(voice.toLowerCase()) ? voice.toLowerCase() : 'nova';

    // Fazer requisição usando fetch nativo do Node 18+
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: chosenVoice
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API de TTS da OpenAI:', response.status, errorText);
      return {
        statusCode: response.status,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Erro ao converter texto em voz na API da OpenAI.' })
      };
    }

    // Obter buffer binário
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Retorna o áudio em formato Base64 para que o Netlify entregue como binário
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400' // cache inteligente de 1 dia para respostas idênticas
      },
      body: base64Audio,
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Erro geral no handler de TTS:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Erro interno no servidor de voz.',
        details: error.message
      })
    };
  }
};
