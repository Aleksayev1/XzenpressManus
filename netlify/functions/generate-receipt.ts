import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Generate receipt/invoice for a completed payment
 * Returns HTML that can be converted to PDF on frontend
 */
export const handler: Handler = async (event: HandlerEvent) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    try {
        const { subscriptionId } = event.queryStringParameters || {};

        if (!subscriptionId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing subscriptionId' }),
            };
        }

        // Get subscription data
        const { data: subscription, error } = await supabase
            .from('premium_subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .single();

        if (error || !subscription) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Subscription not found' }),
            };
        }

        // Get user data
        const { data: userData } = await supabase.auth.admin.getUserById(
            subscription.user_id
        );

        const userEmail = userData?.user?.email || 'N/A';

        // Generate receipt HTML
        const receiptHTML = generateReceiptHTML({
            subscriptionId: subscription.id,
            userEmail,
            amount: subscription.amount,
            currency: subscription.currency,
            plan: subscription.plan,
            paymentMethod: subscription.payment_method,
            activatedAt: subscription.activated_at,
            expiresAt: subscription.expires_at,
            stripePaymentIntentId: subscription.stripe_payment_intent_id,
        });

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'text/html',
            },
            body: receiptHTML,
        };
    } catch (error: any) {
        console.error('Receipt generation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to generate receipt',
                details: error.message,
            }),
        };
    }
};

function generateReceiptHTML(data: {
    subscriptionId: string;
    userEmail: string;
    amount: number;
    currency: string;
    plan: string;
    paymentMethod: string;
    activatedAt: string;
    expiresAt: string;
    stripePaymentIntentId: string;
}): string {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: data.currency.toUpperCase(),
    }).format(data.amount);

    const formattedDate = new Date(data.activatedAt).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const expiresDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo - XZenPress Premium</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 16px;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .label {
      color: #666;
      font-weight: 500;
    }
    
    .value {
      color: #333;
      font-weight: 600;
      text-align: right;
    }
    
    .total-section {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      padding: 25px;
      border-radius: 12px;
      margin-top: 30px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .total-label {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    
    .total-value {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 30px 40px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 10px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .receipt {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <h1>🧘 XZenPress Premium</h1>
      <p>Recibo de Pagamento</p>
      <div class="badge">✓ PAGAMENTO CONFIRMADO</div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Customer Info -->
      <div class="section">
        <h2 class="section-title">Informações do Cliente</h2>
        <div class="info-row">
          <span class="label">Email</span>
          <span class="value">${data.userEmail}</span>
        </div>
        <div class="info-row">
          <span class="label">Data do Pagamento</span>
          <span class="value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="label">ID da Assinatura</span>
          <span class="value">${data.subscriptionId.substring(0, 18)}...</span>
        </div>
      </div>
      
      <!-- Purchase Details -->
      <div class="section">
        <h2 class="section-title">Detalhes da Compra</h2>
        <div class="info-row">
          <span class="label">Plano</span>
          <span class="value">Premium ${data.plan === 'lifetime' ? 'Vitalício' : data.plan === 'annual' ? 'Anual' : 'Mensal'}</span>
        </div>
        <div class="info-row">
          <span class="label">Método de Pagamento</span>
          <span class="value">${data.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</span>
        </div>
        <div class="info-row">
          <span class="label">Validade</span>
          <span class="value">${data.plan === 'lifetime' ? 'Vitalício' : `Até ${expiresDate}`}</span>
        </div>
        ${data.stripePaymentIntentId ? `
        <div class="info-row">
          <span class="label">ID Stripe</span>
          <span class="value">${data.stripePaymentIntentId.substring(0, 20)}...</span>
        </div>
        ` : ''}
      </div>
      
      <!-- Total -->
      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Total Pago</span>
          <span class="total-value">${formattedAmount}</span>
        </div>
      </div>
      
      <!-- Features -->
      <div class="section" style="margin-top: 30px;">
        <h2 class="section-title">Recursos Incluídos</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 8px 0; color: #333;">✓ Acesso completo a todos os pontos de acupressão</li>
          <li style="padding: 8px 0; color: #333;">✓ 12 Jornadas Clínicas guiadas</li>
          <li style="padding: 8px 0; color: #333;">✓ Cromoterapia e Sons Terapêuticos</li>
          <li style="padding: 8px 0; color: #333;">✓ Dashboard de progresso</li>
          <li style="padding: 8px 0; color: #333;">✓ Suporte prioritário</li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>XZenPress Wellness</strong></p>
      <p>Medicina Integrativa e Bem-Estar Digital</p>
      <p style="margin-top: 15px;">
        <a href="mailto:aleksayevacupress@gmail.com">aleksayevacupress@gmail.com</a> | 
        <a href="https://xzenpress.com">xzenpress.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        Este documento é uma confirmação de pagamento. Guarde para seus registros.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
