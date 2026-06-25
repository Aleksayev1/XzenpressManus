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
const IS_PRODUCTION = process.env.JUNCTION_ENV === 'production';
const JUNCTION_BASE_URL = IS_PRODUCTION
    ? 'https://api.tryvital.io'          // produção
    : 'https://api.sandbox.tryvital.io'; // sandbox (padrão)

// Widget URL também precisa ser do mesmo ambiente que a API!
// Token de sandbox NÃO funciona no widget de produção (causa 401)
const JUNCTION_LINK_BASE = IS_PRODUCTION
    ? 'https://link.tryvital.io'         // widget produção
    : 'https://link.sandbox.tryvital.io'; // widget sandbox

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

            // Lê o body UMA única vez para evitar "body already read" errors
            const createUserStatus = createUserRes.status;
            let createUserData: any = null;
            try {
                createUserData = await createUserRes.json();
            } catch (_) { /* body pode não ser JSON em alguns erros */ }

            // Erro real: não é 200/201 (criado) nem 409/400 (já existe)
            if (!createUserRes.ok && createUserStatus !== 409 && createUserStatus !== 400) {
                const errDetails = createUserData ? JSON.stringify(createUserData) : `HTTP ${createUserStatus}`;
                console.error('❌ Erro ao criar usuário no Junction:', errDetails);
                return {
                    statusCode: 502,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Erro ao registrar usuário no Junction', details: errDetails }),
                };
            }

            // Extrair o junction_user_id da resposta (necessário para gerar o link token)
            let junctionUserId: string = '';

            if (createUserRes.ok && createUserData?.user_id) {
                // Novo usuário criado com sucesso — usa o user_id retornado
                junctionUserId = createUserData.user_id;
                console.log(`✅ Junction user_id criado: ${junctionUserId}`);
            } else {
                // Usuário já existe (409/400) — resolve o user_id interno pelo client_user_id
                console.log(`⚠️ Usuário já existe (${createUserStatus}), resolvendo Junction user_id...`);
                const getUserRes = await fetch(
                    `${JUNCTION_BASE_URL}/v2/user/resolve/${encodeURIComponent(userId)}`,
                    {
                        headers: { 'x-vital-api-key': JUNCTION_API_KEY },
                    }
                );
                if (getUserRes.ok) {
                    const userData = await getUserRes.json();
                    if (userData.user_id) {
                        junctionUserId = userData.user_id;
                        console.log(`✅ Junction user_id resolvido: ${junctionUserId}`);
                    }
                } else {
                    const resolveErr = await getUserRes.text();
                    console.error('❌ Falha ao resolver Junction user_id:', resolveErr);
                    return {
                        statusCode: 502,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Não foi possível resolver o usuário no Junction', details: resolveErr }),
                    };
                }
            }

            // Segurança: garantir que temos um Junction user_id válido
            if (!junctionUserId) {
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Junction user_id não pôde ser determinado' }),
                };
            }

            // 2. Gerar o link de conexão OAuth usando o Junction user_id interno
            const linkRes = await fetch(
                `${JUNCTION_BASE_URL}/v2/link/token`,
                {
                    method: 'POST',
                    headers: {
                        'x-vital-api-key': JUNCTION_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: junctionUserId,
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
            // CRÍTICO: usar o mesmo ambiente da API (sandbox ou produção)
            // Token de sandbox falha com 401 se usado no widget de produção
            const widgetUrl = `${JUNCTION_LINK_BASE}/?token=${link_token}&region=${JUNCTION_REGION}`;
            console.log(`🌐 Widget URL (${IS_PRODUCTION ? 'PROD' : 'SANDBOX'}): ${widgetUrl}`);

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
