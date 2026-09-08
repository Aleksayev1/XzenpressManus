import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Send transactional emails
 * Handles welcome, payment_confirmation, refund_confirmation, and protocol_360 official reports
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

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, userId, data, email: directEmail, recipientEmail } = body;

    // Resolve user email
    let userEmail = directEmail || recipientEmail || data?.userEmail || data?.email;
    if (!userEmail && userId) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        userEmail = userData?.user?.email;
      } catch (e) {
        console.warn('Could not fetch user by ID:', e);
      }
    }

    if (!userEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User email not found' }),
      };
    }

    let emailHTML = '';
    let subject = '';

    switch (type) {
      case 'welcome':
        subject = '🎉 Bem-vindo ao XZenPress!';
        emailHTML = generateWelcomeEmail(userEmail);
        break;

      case 'payment_confirmation':
        subject = '✅ Pagamento Confirmado - XZenPress Premium';
        emailHTML = generatePaymentConfirmationEmail(data);
        break;

      case 'refund_confirmation':
        subject = '💰 Reembolso Processado - XZenPress';
        emailHTML = generateRefundConfirmationEmail(data);
        break;

      case 'protocol_360': {
        const protocolTitle = data?.protocol?.titulo || 'Protocolo de Saúde Integrativa 360°';
        subject = `🌿 Seu Relatório Oficial 360°: ${protocolTitle}`;
        emailHTML = generateProtocol360Email(data, userEmail);
        break;
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid email type' }),
        };
    }

    // Attempt delivery via Resend if API key is provided
    let sentViaProvider = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'XZenPress 360° <relatorios@xzenpress.com>',
            to: [userEmail],
            subject: subject,
            html: emailHTML,
          }),
        });

        if (resendRes.ok) {
          sentViaProvider = true;
          console.log(`✅ Email ${type} enviado via Resend para ${userEmail}`);
        } else {
          const errText = await resendRes.text();
          console.warn('⚠️ Resend retornou status não-OK:', errText);
        }
      } catch (sendErr) {
        console.warn('⚠️ Falha ao contactar Resend:', sendErr);
      }
    }

    console.log(`📧 Email [${type}] processado para ${userEmail} (sentViaProvider: ${sentViaProvider})`);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        sent: sentViaProvider,
        message: sentViaProvider
          ? `Relatório oficial enviado com sucesso para ${userEmail}!`
          : `Relatório oficial gerado e pronto para impressão/envio para ${userEmail}!`,
        subject,
        html: emailHTML,
      }),
    };
  } catch (error: any) {
    console.error('Email generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate email' }),
    };
  }
};

function generateWelcomeEmail(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    .container { max-width: 600px; margin: 20px auto; padding: 0; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #059669 0%, #0891b2 100%); color: white; padding: 40px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 24px 0; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 26px;">🧘 Bem-vindo ao XZenPress!</h1>
    </div>
    <div class="content">
      <p>Olá!</p>
      <p>Estamos muito felizes em ter você conosco! 🎉</p>
      <p>O XZenPress é sua plataforma completa de bem-estar digital e saúde integrativa, combinando acupressão (YNSA & MTC), respiração terapêutica, fitoterapia de precisão e nutrição celular.</p>
      
      <h3>✨ Próximos Passos:</h3>
      <ul>
        <li>Explore os <strong>pontos de acupressão</strong></li>
        <li>Experimente a <strong>Sessão Mestra</strong> com o Robozinho Zen</li>
        <li>Gere seu <strong>Protocolo 360°</strong> personalizado</li>
      </ul>

      <div style="text-align: center;">
        <a href="https://xzenpress.com" class="button">Começar Agora</a>
      </div>

      <p>Se tiver dúvidas, responda a este email. Estamos sempre aqui para apoiar sua vitalidade!</p>
      <p><strong>Equipe XZenPress</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 XZenPress Wellness | <a href="https://xzenpress.com" style="color:#059669;">xzenpress.com</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePaymentConfirmationEmail(data: any): string {
  const amount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: data.currency?.toUpperCase() || 'BRL',
  }).format(data.amount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 36px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .amount { font-size: 32px; font-weight: 800; color: #059669; margin: 16px 0; }
    .details { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #059669; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
      <h1 style="margin:0; font-size: 24px;">Pagamento Confirmado!</h1>
    </div>
    <div class="content">
      <p>Ótimas notícias! Seu pagamento foi processado com sucesso.</p>
      
      <div style="text-align: center;">
        <div class="amount">${amount}</div>
      </div>

      <div class="details">
        <p style="margin:6px 0;"><strong>Plano:</strong> Premium ${data.plan || 'Vitalício'}</p>
        <p style="margin:6px 0;"><strong>Método:</strong> ${data.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</p>
        <p style="margin:6px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <p>Seu acesso Premium ilimitado foi ativado! Aproveite consultas ilimitadas ao Oráculo 360°, emissão de relatórios, acompanhamento no Mapa Vivo e muito mais.</p>

      <div style="text-align: center;">
        <a href="https://xzenpress.com" class="button">Acessar Minha Conta</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 XZenPress Wellness | <a href="https://xzenpress.com" style="color:#059669;">xzenpress.com</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateRefundConfirmationEmail(data: any): string {
  const amount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: data.currency?.toUpperCase() || 'BRL',
  }).format(data.amount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 36px 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .amount { font-size: 32px; font-weight: 800; color: #2563eb; margin: 16px 0; }
    .details { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">💰 Reembolso Processado</h1>
    </div>
    <div class="content">
      <p>Seu reembolso foi processado com sucesso.</p>
      
      <div style="text-align: center;">
        <div class="amount">${amount}</div>
      </div>

      <div class="details">
        <p style="margin:6px 0;"><strong>Valor:</strong> ${amount}</p>
        <p style="margin:6px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <p style="margin:6px 0;"><strong>Prazo:</strong> 5-10 dias úteis</p>
      </div>

      <p>O valor será creditado em sua conta de acordo com as políticas de sua instituição financeira.</p>
      <p>Sentiremos sua falta! Se mudar de ideia, estaremos sempre aqui. 💙</p>
    </div>
    <div class="footer">
      <p>© 2026 XZenPress Wellness | <a href="https://xzenpress.com" style="color:#2563eb;">xzenpress.com</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates clinical-grade, high-authority Official 360° Report Email
 */
function generateProtocol360Email(data: any, email: string): string {
  const protocol = data?.protocol || {};
  const query = data?.query || 'Queixa Geral';
  const userName = data?.userName || email.split('@')[0];
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deficienciasHtml = (protocol.deficiencias || [])
    .map((d: any) => `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #059669; border-radius:8px; padding:14px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:15px; color:#0f172a;">${d.nutriente}</strong>
          <span style="font-size:10px; font-weight:800; text-transform:uppercase; background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:4px;">
            Probabilidade ${d.probabilidade || 'Alta'}
          </span>
        </div>
        <p style="margin:4px 0 8px 0; font-size:13px; color:#334155; line-height:1.5;">${d.mecanismo || ''}</p>
        <small style="font-size:11px; color:#64748b; font-style:italic;">📚 Evidência: ${d.evidencia || ''}</small>
      </div>
    `).join('');

  const suplementosHtml = (protocol.protocolo?.suplementos || [])
    .map((s: any, idx: number) => `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px 12px; font-size:13px; font-weight:700; color:#0f172a;">${idx + 1}. ${s.nome}</td>
        <td style="padding:10px 12px; font-size:12px; color:#334155;">${s.dose}</td>
        <td style="padding:10px 12px; font-size:12px; color:#059669; font-weight:600;">${s.timing}</td>
        <td style="padding:10px 12px; font-size:11px; color:#64748b; font-style:italic;">${s.sinergia}</td>
      </tr>
    `).join('');

  const plantasBr = protocol.protocolo?.fitoterapia?.plantasBrasileiras || [];
  const plantasMTC = protocol.protocolo?.fitoterapia?.plantasMTC || [];

  const plantasHtml = `
    <div style="display:flex; flex-wrap:wrap; gap:16px; margin-top:8px;">
      ${plantasBr.length > 0 ? `
        <div style="flex:1; min-width:240px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; padding:14px;">
          <strong style="color:#065f46; font-size:13px;">🇧🇷 Fitoterapia Brasileira:</strong>
          <ul style="margin:8px 0 0 16px; padding:0; font-size:13px; color:#047857; line-height:1.6;">
            ${plantasBr.map((p: string) => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${plantasMTC.length > 0 ? `
        <div style="flex:1; min-width:240px; background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:14px;">
          <strong style="color:#9a3412; font-size:13px;">🏮 Fitoterapia Chinesa / Pinyin:</strong>
          <ul style="margin:8px 0 0 16px; padding:0; font-size:13px; color:#c2410c; line-height:1.6;">
            ${plantasMTC.map((p: string) => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  const priorizarList = (protocol.protocolo?.alimentacao?.priorizar || []).map((a: string) => `<li>✓ ${a}</li>`).join('');
  const evitarList = (protocol.protocolo?.alimentacao?.evitar || []).map((a: string) => `<li>✗ ${a}</li>`).join('');

  const alertasHtml = (protocol.alertas || []).map((al: string) => `<li>⚠️ ${al}</li>`).join('');
  const fontesHtml = (protocol.fontes || []).map((f: string, i: number) => `<span style="display:inline-block; margin-right:12px; margin-bottom:4px;">[${i + 1}] ${f}</span>`).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Oficial Protocolo 360° - XZenPress</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #0f172a;
      background-color: #0f172a;
      margin: 0;
      padding: 20px 10px;
    }
    .wrapper {
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #022c22 0%, #064e3b 40%, #0f172a 100%);
      color: #ffffff;
      padding: 36px 30px;
      position: relative;
    }
    .header-badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.25;
      margin: 0 0 10px 0;
      color: #f8fafc;
    }
    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid rgba(255,255,255,0.12);
      padding-top: 14px;
      margin-top: 14px;
    }
    .meta-bar span strong {
      color: #e2e8f0;
    }
    .content {
      padding: 30px;
      background: #ffffff;
    }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #059669;
      margin: 28px 0 12px 0;
      display: flex;
      align-items: center;
      border-bottom: 2px solid #ecfdf5;
      padding-bottom: 6px;
    }
    .callout {
      background: #f1f5f9;
      border-left: 4px solid #6366f1;
      padding: 16px 20px;
      border-radius: 0 12px 12px 0;
      font-style: italic;
      color: #334155;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }
    .food-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 8px;
    }
    .food-col {
      flex: 1;
      min-width: 220px;
      padding: 14px;
      border-radius: 10px;
    }
    .food-priorizar {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .food-evitar {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #9f1239;
    }
    .recipe-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 14px 18px;
      margin-top: 14px;
      color: #78350f;
      font-size: 13px;
      line-height: 1.6;
    }
    .disclaimer-box {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: 10px;
      padding: 16px;
      color: #991b1b;
      font-size: 12px;
      line-height: 1.5;
      margin-top: 30px;
    }
    .footer {
      background: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 26px 20px;
      font-size: 12px;
    }
    .print-btn-bar {
      text-align: center;
      margin: 24px 0 10px 0;
    }
    .btn-print {
      display: inline-block;
      background: #059669;
      color: #ffffff;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }
    @media print {
      body { background: white; padding: 0; }
      .wrapper { box-shadow: none; border: none; max-width: 100%; }
      .print-btn-bar, .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="header-badge">🌿 XZenPress Saúde Integrativa 360° · Dossiê Clínico</div>
      <h1 class="title">${protocol.titulo || 'Protocolo Integrativo 360°'}</h1>
      <div class="meta-bar">
        <span><strong>Paciente / Usuário:</strong> ${userName}</span>
        <span><strong>Queixa Inicial:</strong> "${query}"</span>
        <span><strong>Emissão:</strong> ${dateStr}</span>
        <span><strong>Autenticação:</strong> Certificado Digital XZen</span>
      </div>
    </div>

    <!-- Content -->
    <div class="content">

      <div class="print-btn-bar no-print">
        <button onclick="window.print()" class="btn-print" style="border:none; cursor:pointer;">
          🖨️ Imprimir / Salvar como PDF Oficial
        </button>
      </div>

      <!-- Visao Integrativa -->
      <div class="section-title">🧭 Visão Sistêmica & Causalidade Epigenética</div>
      <div class="callout">
        "${protocol.visaoIntegrativa || 'Análise sistêmica integrando bioquímica nutricional, medicina funcional e biorritmo circadiano.'}"
      </div>

      <!-- Deficiencias Rastreadas -->
      <div class="section-title">🔬 Deficiências Nutricionais Rastreadas</div>
      ${deficienciasHtml || '<p style="color:#64748b; font-size:13px;">Nenhuma deficiência primária crítica apontada.</p>'}

      <!-- Nutricao Funcional -->
      <div class="section-title">🥗 Nutrição Funcional & Culinária Terapêutica</div>
      <div class="food-grid">
        <div class="food-col food-priorizar">
          <strong style="font-size:13px; display:block; margin-bottom:6px;">✓ Alimentos para Priorizar:</strong>
          <ul style="margin:0; padding-left:18px; font-size:12px; line-height:1.6;">
            ${priorizarList || '<li>Vegetais verdes escuros, proteínas limpas</li>'}
          </ul>
        </div>
        <div class="food-col food-evitar">
          <strong style="font-size:13px; display:block; margin-bottom:6px;">✗ Alimentos para Evitar / Reduzir:</strong>
          <ul style="margin:0; padding-left:18px; font-size:12px; line-height:1.6;">
            ${evitarList || '<li>Ultraprocessados, açúcares refinados</li>'}
          </ul>
        </div>
      </div>
      ${protocol.protocolo?.alimentacao?.receitaMTC ? `
        <div class="recipe-box">
          <strong>🍵 Receita Baseada nos 5 Elementos da MTC:</strong><br/>
          ${protocol.protocolo.alimentacao.receitaMTC}
        </div>
      ` : ''}

      <!-- Suplementacao -->
      <div class="section-title">💊 Suplementação Integrativa & Sinergias de Absorção</div>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Suplemento</th>
              <th>Dosagem / Forma</th>
              <th>Momento (Timing)</th>
              <th>Sinergia / Mecanismo</th>
            </tr>
          </thead>
          <tbody>
            ${suplementosHtml || '<tr><td colspan="4" style="padding:10px; text-align:center; color:#64748b;">Nenhum suplemento sintético exigido.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Fitoterapia -->
      <div class="section-title">🌱 Fitoterapia Personalizada (Botânica & Ervas)</div>
      ${plantasHtml}

      <!-- Acupressao & Praticas -->
      ${((protocol.protocolo?.pontosYNSA && protocol.protocolo.pontosYNSA.length > 0) || (protocol.protocolo?.pontosMTC && protocol.protocolo.pontosMTC.length > 0)) ? `
        <div class="section-title">💆 Pontos de Acupressão (MTC & Craniopuntura YNSA)</div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; font-size:13px; color:#334155; line-height:1.6;">
          ${protocol.protocolo?.pontosMTC?.length ? `<p style="margin:0 0 8px 0;"><strong>Meridianos Tradicionais:</strong> ${protocol.protocolo.pontosMTC.join(' · ')}</p>` : ''}
          ${protocol.protocolo?.pontosYNSA?.length ? `<p style="margin:0;"><strong>Craniopuntura de Yamamoto (YNSA):</strong> ${protocol.protocolo.pontosYNSA.join(' · ')}</p>` : ''}
        </div>
      ` : ''}

      <!-- Campo Emocional & Mente -->
      ${protocol.almaEmocional ? `
        <div class="section-title">🧠 Psicossomática & Campo Emocional</div>
        <p style="font-size:13px; color:#334155; line-height:1.6; background:#fdf4ff; border:1px solid #f5d0fe; border-radius:10px; padding:14px; font-style:italic;">
          "${protocol.almaEmocional}"
        </p>
      ` : ''}

      <!-- Alertas de Seguranca -->
      ${protocol.alertas && protocol.alertas.length > 0 ? `
        <div class="disclaimer-box">
          <strong style="font-size:13px; display:block; margin-bottom:6px;">⚠️ Alertas de Segurança & Interações:</strong>
          <ul style="margin:0; padding-left:18px;">
            ${alertasHtml}
          </ul>
        </div>
      ` : ''}

      <!-- Fontes Cientificas -->
      ${protocol.fontes && protocol.fontes.length > 0 ? `
        <div style="margin-top:24px; padding-top:14px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8;">
          <strong style="color:#64748b;">🔬 Referências Literárias e Científicas:</strong><br/>
          ${fontesHtml}
        </div>
      ` : ''}

    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin:0 0 8px 0; font-weight:700; color:#f8fafc;">XZenPress Wellness Technologies · Saúde de Precisão & Longevidade</p>
      <p style="margin:0 0 12px 0; font-size:11px; color:#64748b;">
        Este relatório é um recurso educacional de apoio integrativo e estilo de vida. Não substitui consulta, diagnóstico ou conduta médica profissional.
      </p>
      <p style="margin:0; font-size:11px;">
        Acesse sua jornada contínua em <a href="https://xzenpress.com" style="color:#34d399; text-decoration:none;">xzenpress.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
