const ALLOWED_ORIGINS = [
  'https://xzenpress.com',
  'https://www.xzenpress.com',
  'https://xzenpressbolt.netlify.app',
  'https://incredible-hummingbird-dda3e2.netlify.app',
  'https://xzenpress-app.netlify.app'
];

const ALLOWED_LOCAL_PATTERNS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^capacitor:\/\/localhost$/,
  /^https:\/\/localhost$/,
  /^file:\/\/$/
];

function getCorsHeaders(event) {
  // Pegar origin de forma case-insensitive
  const origin = event.headers.origin || event.headers.Origin;
  let allowedOrigin = 'https://xzenpress.com'; // Fallback seguro padrão

  if (origin) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || 
                      ALLOWED_LOCAL_PATTERNS.some(pattern => pattern.test(origin));
    if (isAllowed) {
      allowedOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
    'Vary': 'Origin'
  };
}

function isOriginAllowed(event) {
  const origin = event.headers.origin || event.headers.Origin;
  if (!origin) {
    // Se não houver Origin, verifica o Referer (comum em navegadores e webviews)
    const referer = event.headers.referer || event.headers.Referer;
    if (referer) {
      try {
        const parsedReferer = new URL(referer);
        const host = parsedReferer.origin;
        return ALLOWED_ORIGINS.includes(host) || 
               ALLOWED_LOCAL_PATTERNS.some(pattern => pattern.test(host));
      } catch (e) {
        return false;
      }
    }
    return true; // Tolera requisições sem origin/referer (ex: app nativo em algumas plataformas)
  }

  return ALLOWED_ORIGINS.includes(origin) || 
         ALLOWED_LOCAL_PATTERNS.some(pattern => pattern.test(origin));
}

module.exports = { getCorsHeaders, isOriginAllowed };
