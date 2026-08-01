// Netlify Edge Function: seo-prerender.js
// Detecta crawlers (Googlebot, Bingbot, Social Bots) e injeta HTML pré-renderizado + Schema.org (GEO)
// Resolve a queda de 85,7% de SEO orgânico do SPA sem reescrever a aplicação em React

const BOT_USER_AGENTS = /googlebot|bingbot|yandexbot|duckduckbot|slurp|twitterbot|facebookexternalhit|linkedinbot|embedly|baiduspider|pinterest|chatgpt-user|gptbot|claudebot|perplexbot/i;

const PAGE_SEO_DATA = {
  "/medicina": {
    title: "XZenPress Medicina Integrativa & Bioacústica",
    description: "Protocolos clínicos de acupressão, variabilidade da frequência cardíaca (VFC) e ativação do nervo vago baseados em evidências.",
    schemaType: "MedicalWebPage",
    keywords: ["medicina integrativa", "nervo vago", "VFC", "acupressão clínica", "bioacústica"],
    faq: [
      { q: "O que é medicina integrativa bioacústica?", a: "É a combinação de biofeedback, frequências acústicas e pontos de pressão para regulação do sistema nervoso autônomo." }
    ]
  },
  "/acupressao": {
    title: "Acupressão para Ansiedade e Alívio da Dor | XZenPress",
    description: "Aprenda pontos de estimulação rápida de acupressão para alívio imediato do estresse, ansiedade, dores de cabeça e insônia.",
    schemaType: "MedicalProcedure",
    keywords: ["acupressão", "pontos de pressão ansiedade", "nervo vago", "pontos de acupuntura em 60s"],
    faq: [
      { q: "Como a acupressão reduz o estresse rapidamente?", a: "Pressionar pontos como Shenmen (C7) ou Yintang (EX-HN3) estimula a liberação de endorfinas e reduz o cortisol em minutos." }
    ]
  },
  "/sessao-mestra": {
    title: "Sessão Mestra ✨ Guiada por IA | XZenPress",
    description: "Sessões guiadas de biofeedback, respiração e som binaural para modulação profunda do estresse e foco em 15 minutos.",
    schemaType: "HealthAndWellnessGuidance",
    keywords: ["sessão mestra", "biofeedback guiado", "binaural", "autorregulação emocional"],
    faq: [
      { q: "Quanto tempo dura uma Sessão Mestra?", a: "As sessões variam entre 5 e 15 minutos com respostas mensuráveis de VFC pré e pós sessão." }
    ]
  },
  "/self-oracle": {
    title: "Self Oracle IA — Análise de Saúde & Biofeedback Emocional",
    description: "Assistente de IA conversacional para identificação de padrões de estresse, nutrição integrativa e recomendações personalizadas.",
    schemaType: "SoftwareApplication",
    keywords: ["Self Oracle IA", "IA de saúde", "biofeedback emocional", "triagem integrativa"],
    faq: [
      { q: "Como o Self Oracle analisa minha saúde?", a: "Através da análise da sua anamnese, linguagem e parâmetros autorreportados, a IA sugere protocolos sob medida." }
    ]
  }
};

export default async (request, context) => {
  const userAgent = request.headers.get("user-agent") || "";
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  const isBot = BOT_USER_AGENTS.test(userAgent);

  // Se não for bot ou não for página cadastrada, segue fluxo padrão SPA
  if (!isBot) {
    return context.next();
  }

  const seoInfo = PAGE_SEO_DATA[pathname];

  // Buscar a resposta original da página HTML
  const response = await context.next();
  const html = await response.text();

  if (!seoInfo) {
    return new Response(html, response);
  }

  // Schema.org GEO (Generative Engine Optimization) em JSON-LD
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": seoInfo.schemaType,
    "name": seoInfo.title,
    "description": seoInfo.description,
    "url": request.url,
    "provider": {
      "@type": "Organization",
      "name": "XZenPress",
      "url": "https://xzenpress.com"
    }
  };

  if (seoInfo.faq && seoInfo.faq.length > 0) {
    schemaJsonLd["mainEntity"] = seoInfo.faq.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }));
  }

  // Injetar meta tags e JSON-LD no HTML antes do fechamento do </head>
  const injectedTags = `
    <title>${seoInfo.title}</title>
    <meta name="description" content="${seoInfo.description}">
    <meta name="keywords" content="${seoInfo.keywords.join(", ")}">
    <meta property="og:title" content="${seoInfo.title}">
    <meta property="og:description" content="${seoInfo.description}">
    <meta property="og:type" content="website">
    <script type="application/ld+json">
      ${JSON.stringify(schemaJsonLd, null, 2)}
    </script>
  `;

  const prerenderedHtml = html.replace("</head>", `${injectedTags}\n</head>`);

  return new Response(prerenderedHtml, {
    headers: {
      ...response.headers,
      "content-type": "text/html; charset=utf-8",
      "x-prerender-edge": "true"
    }
  });
};
