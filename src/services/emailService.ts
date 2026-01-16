import { supabase } from '../lib/supabase';

export interface EmailData {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export class EmailService {
    /**
     * Envia email de confirmação de pagamento PIX
     */
    static async sendPixPaymentConfirmation(
        customerEmail: string,
        customerName: string,
        amount: number,
        orderId: string,
        paymentDate: string
    ): Promise<boolean> {
        try {
            const emailHtml = this.generatePixConfirmationEmail(
                customerName,
                amount,
                orderId,
                paymentDate
            );

            // Usar Supabase para enviar email
            // Nota: Isso requer configuração de SMTP no Supabase
            // Alternativa: Usar uma Edge Function do Supabase

            console.log('📧 Email PIX preparado para:', customerEmail);
            console.log('📄 Conteúdo:', emailHtml);

            // TODO: Implementar envio real via Supabase Edge Function ou SMTP
            // Por enquanto, apenas log para desenvolvimento

            return true;
        } catch (error) {
            console.error('❌ Erro ao enviar email PIX:', error);
            return false;
        }
    }

    /**
     * Envia email de boas-vindas Premium
     */
    static async sendWelcomePremiumEmail(
        customerEmail: string,
        customerName: string
    ): Promise<boolean> {
        try {
            const emailHtml = this.generateWelcomeEmail(customerName);

            console.log('📧 Email de boas-vindas preparado para:', customerEmail);
            console.log('📄 Conteúdo:', emailHtml);

            // TODO: Implementar envio real

            return true;
        } catch (error) {
            console.error('❌ Erro ao enviar email de boas-vindas:', error);
            return false;
        }
    }

    /**
     * Template de email de confirmação PIX
     */
    private static generatePixConfirmationEmail(
        customerName: string,
        amount: number,
        orderId: string,
        paymentDate: string
    ): string {
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Confirmado - XZenPress</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #0891b2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ✅ Pagamento Confirmado!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${customerName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Seu pagamento via <strong>PIX</strong> foi confirmado com sucesso! 🎉
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Você agora tem acesso completo a todos os recursos <strong>Premium</strong> do XZenPress.
              </p>

              <!-- Payment Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">
                      📋 Detalhes do Pagamento
                    </h3>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Valor:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: bold; text-align: right;">
                          R$ ${amount.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Pedido:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: bold; text-align: right;">
                          ${orderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Data:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: bold; text-align: right;">
                          ${paymentDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Método:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: bold; text-align: right;">
                          PIX
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Status:</td>
                        <td style="color: #059669; font-size: 14px; font-weight: bold; text-align: right;">
                          ✅ PAGO
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://xzenpress.com" 
                       style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🚀 Acessar XZenPress Premium
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Premium Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 16px;">
                      🎁 Seus Benefícios Premium
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>🤖 Assistente IA Especializado 24/7</li>
                      <li>🎯 66 Pontos de Acupressão Exclusivos</li>
                      <li>🎵 Biblioteca Completa de Sons Terapêuticos</li>
                      <li>📊 12 Jornadas Clínicas Guiadas</li>
                      <li>✨ Acesso Ilimitado a Todos os Recursos</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Se tiver alguma dúvida, estamos aqui para ajudar!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2026 XZenPress - Plataforma de Bem-Estar Holística
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="https://xzenpress.com" style="color: #059669; text-decoration: none;">xzenpress.com</a> | 
                <a href="mailto:aleksayevacupress@gmail.com" style="color: #059669; text-decoration: none;">Suporte</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }

    /**
     * Template de email de boas-vindas
     */
    private static generateWelcomeEmail(customerName: string): string {
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao XZenPress Premium</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #0891b2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">
                🎉 Bem-vindo ao Premium!
              </h1>
              <p style="color: #ffffff; margin: 0; font-size: 16px; opacity: 0.9;">
                Sua jornada de bem-estar começa agora
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${customerName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                É com grande alegria que damos as boas-vindas ao <strong>XZenPress Premium</strong>! 🌟
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Você agora faz parte de uma comunidade dedicada ao bem-estar integral através da Medicina Tradicional Chinesa e tecnologia de ponta.
              </p>

              <!-- Quick Start Guide -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">
                      🚀 Primeiros Passos
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>Explore os <strong>66 pontos de acupressão</strong> exclusivos</li>
                      <li>Converse com o <strong>Assistente IA</strong> especializado</li>
                      <li>Experimente as <strong>12 Jornadas Clínicas</strong> guiadas</li>
                      <li>Relaxe com nossa <strong>biblioteca de sons</strong> terapêuticos</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://xzenpress.com" 
                       style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🎯 Começar Agora
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Estamos aqui para apoiar sua jornada de bem-estar. Qualquer dúvida, é só chamar!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2026 XZenPress - Plataforma de Bem-Estar Holística
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="https://xzenpress.com" style="color: #059669; text-decoration: none;">xzenpress.com</a> | 
                <a href="mailto:aleksayevacupress@gmail.com" style="color: #059669; text-decoration: none;">Suporte</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
}
