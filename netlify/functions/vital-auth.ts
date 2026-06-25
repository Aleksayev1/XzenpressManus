import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// Junction (formerly Vital) OAuth Auth Function
// Gera o link de conexão para o usuário vincular seu wearable
// Docs: https://docs.junction.com/reference/link/generate-link-token
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Chave da API Junction — adicionar no Netlify > Environment Variables
// Nome: JUNCTION_API_KEY   Valor: sk_sandbox_... (pegar em app.junction.com)
const JUNCTION_API_KEY  = process.env.JUNCTION_API_KEY || '';
const JUNCTION_BASE_URL = process.env.JUNCTION_ENV === 'production'
    ? 'https://api.tryvital.io'    // produção
    : 'https://api.sandbox.tryvital.io'; // sandbox (padrão)

const JUNCTION_REGION = process.env.JUNCTION_REGION || 'us'; // 'us' ou 'eu'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
};

export const handler: Handler = async (event: HandlerEvent) => {
    // ── CORS preflight ─────────────────────────────────────────────────────
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    // ── Verificar chave da API configurada ─────────────────────────────────
    if (!JUNCTION_API_KEY) {
        console.error('❌ JUNCTION_API_KEY não configurada nas variáveis de ambiente Netlify');
        return {
            statusCode: 503,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Serviço não configurado',
                help: 'Adicione JUNCTION_API_KEY nas env vars do Netlify. Chave disponível em: app.junction.com → Configuração da equipe → API Keys'
            }),
        };
    }

    // ── POST: Gerar link de conexão ────────────────────────────────────────
    if (event.httpMethod === 'POST') {
        try {
            const { userId, redirectUrl } = JSON.parse(event.body || '{}');

            if (!userId) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'userId é obrigatório' }),
                };
            }

            // 1. Registrar o usuário no Junction (idempotente — não cria duplicatas)
            const createUserRes = await fetch(
                `${JUNCTION_BASE_URL}/v2/user`,
                {
                    method: 'POST',
                    headers: {
                        'x-vital-api-key': JUNCTION_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        client_user_id: userId
                    })
                }
            );

            // 201 = criado, 400 (se já existe client_user_id), 409 = já existe — ambos são OK
            if (!createUserRes.ok && createUserRes.status !== 409 && createUserRes.status !== 400) {
                const err = await createUserRes.text();
                console.error('❌ Erro ao criar usuário no Junction:', err);
                return {
                    statusCode: 502,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Erro ao registrar usuário no Junction', details: err }),
                };
            }

            // 2. Gerar o link de conexão OAuth
            const linkRes = await fetch(
                `${JUNCTION_BASE_URL}/v2/link/token`,
                {
                    method: 'POST',
                    headers: {
                        'x-vital-api-key': JUNCTION_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        // URL de retorno após o usuário conectar o wearable
                        redirect_url: redirectUrl || 'https://xzenpress.com/dashboard?wearable=connected',
                        // Filtra apenas providers relevantes para saúde/HRV
                        filter_on_providers: [
                            'garmin',
                            'oura',
                            'polar',
                            'whoop',
                            'fitbit',
                            'apple_health_kit',
                            'google_fit',
                        ],
                    }),
                }
            );

            if (!linkRes.ok) {
                const err = await linkRes.text();
                console.error('❌ Erro ao gerar link Junction:', err);
                return {
                    statusCode: 502,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Erro ao gerar link de conexão', details: err }),
                };
            }

            const { link_token, expires_at } = await linkRes.json();

            // 3. Construir a URL completa do widget
            const widgetUrl = `https://link.tryvital.io/?token=${link_token}&region=${JUNCTION_REGION}`;

            // 4. Atualizar status no Supabase como "pending"
            await supabase
                .from('xzen_user_telemetry_status')
                .upsert({
                    user_id: userId,
                    sync_status: 'pending',
                    last_sync_at: new Date().toISOString(),
                    provider: 'vital',
                });

            console.log(`🔗 Link Junction gerado para usuário ${userId}. Expira: ${expires_at}`);

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    widgetUrl,
                    linkToken: link_token,
                    expiresAt: expires_at,
                }),
            };

        } catch (err: any) {
            console.error('❌ Erro interno vital-auth:', err);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Erro interno', details: err.message }),
            };
        }
    }

    // ── GET: Status da conexão do usuário ──────────────────────────────────
    if (event.httpMethod === 'GET') {
        try {
            const userId = event.queryStringParameters?.userId;
            if (!userId) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'userId é obrigatório' }),
                };
            }

            // Buscar status no Junction
            const statusRes = await fetch(
                `${JUNCTION_BASE_URL}/v2/user/${encodeURIComponent(userId)}/providers`,
                {
                    headers: { 'x-vital-api-key': JUNCTION_API_KEY },
                }
            );

            if (!statusRes.ok) {
                // Usuário não existe ainda no Junction
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ connected: false, providers: [] }),
                };
            }

            const data = await statusRes.json();
            const providers = data.providers || [];

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    connected: providers.length > 0,
                    providers,
                }),
            };

        } catch (err: any) {
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Erro interno', details: err.message }),
            };
        }
    }

    return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Método não permitido' }),
    };
};
