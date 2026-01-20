import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Send transactional emails
 * For now, generates HTML that can be sent via email service
 */
export const handler: Handler = async (event: HandlerEvent) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': '

POST, OPTIONS',
  };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    try {
        const { type, userId, data } = JSON.parse(event.body || '{}');

        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email;

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

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid email type' }),
                };
        }

        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        // For now, just log and return HTML
        console.log(`📧 Email ${type} for ${userEmail}`);

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'text/html',
            },
            body: emailHTML,
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #eee; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧘 Bem-vindo ao XZenPress!</h1>
    </div>
    <div class="content">
      <p>Olá!</p>
      <p>Estamos muito felizes em ter você conosco! 🎉</p>
      <p>O XZenPress é sua plataforma completa de bem-estar digital, combinando acupressão, respiração terapêutica e cromoterapia para transformar sua saúde.</p>
      
      <h3>✨ Próximos Passos:</h3>
      <ul>
        <li>Explore os <strong>pontos gratuitos</strong> de acupressão</li>
        <li>Experimente a <strong>respiração 4-7-8</strong></li>
        <li>Descubra as <strong>12 Jornadas Clínicas</strong></li>
      </ul>

      <div style="text-align: center;">
        <a href="https://xzenpress.com" class="button">Começar Agora</a>
      </div>

      <p>Se tiver dúvidas, responda a este email. Estamos aqui para ajudar!</p>
      <p>Bem-vindo à jornada! 🌟</p>
      <p><strong>Equipe XZenPress</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 XZenPress Wellness | <a href="https://xzenpress.com">xzenpress.com</a></p>
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #eee; }
    .success-icon { font-size: 48px; margin-bottom: 10px; }
    .amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 20px 0; }
    .details { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>Pagamento Confirmado!</h1>
    </div>
    <div class="content">
      <p>Ótimas notícias! Seu pagamento foi processado com sucesso.</p>
      
      <div style="text-align: center;">
        <div class="amount">${amount}</div>
      </div>

      <div class="details">
        <p><strong>Plano:</strong> Premium ${data.plan}</p>
        <p><strong>Método:</strong> ${data.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <p>Seu acesso Premium foi ativado e você já pode aproveitar todos os recursos!</p>

      <div style="text-align: center;">
        <a href="https://xzenpress.com" class="button">Acessar Agora</a>
      </div>

      <p><small>Um recibo detalhado está disponível em sua conta.</small></p>
    </div>
    <div class="footer">
      <p>© 2026 XZenPress Wellness | <a href="https://xzenpress.com">xzenpress.com</a></p>
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #eee; }
    .amount { font-size: 32px; font-weight: bold; color: #3b82f6; margin: 20px 0; }
    .details { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Reembolso Processado</h1>
    </div>
    <div class="content">
      <p>Seu reembolso foi processado com sucesso.</p>
      
      <div style="text-align: center;">
        <div class="amount">${amount}</div>
      </div>

      <div class="details">
        <p><strong>Valor:</strong> ${amount}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Prazo:</strong> 5-10 dias úteis</p>
      </div>

      <p>O valor será creditado em sua conta de acordo com as políticas de sua instituição financeira.</p>
      <p>Sentiremos sua falta! Se mudar de ideia, estaremos sempre aqui. 💙</p>
    </div>
    <div class="footer">
      <p>© 2026 XZenPress Wellness | <a href="https://xzenpress.com">xzenpress.com</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
