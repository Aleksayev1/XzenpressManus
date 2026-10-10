// Netlify Function: Emissão segura de sessão para Gemini 2.0 Multimodal Live API
const { getCorsHeaders, isOriginAllowed } = require('./lib/cors');

exports.handler = async (event) => {
  const headers = getCorsHeaders(event);

  if (!isOriginAllowed(event)) {
    return {
      statusCode: 403,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Origin not allowed' })
    };
  }

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

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 503,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'GEMINI_API_KEY não configurada no servidor' })
      };
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        model: 'models/gemini-2.0-flash-exp',
        wsUrl: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent'
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro interno ao iniciar sessão Live' })
    };
  }
};
