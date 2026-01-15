// Serviço de detecção de país e conversão de preços
export interface RegionalPrice {
    currency: 'USD' | 'BRL';
    symbol: string;
    monthly: number;
    annual: number;
    lifetime: number;
    annualOriginal: number;
    lifetimeOriginal: number;
    countryCode: string;
    countryName: string;
    isPromotional: boolean;
}

// Cache para evitar múltiplas chamadas à API
let cachedCountry: string | null = null;

/**
 * Detecta o país do usuário usando geolocalização IP
 */
export async function detectUserCountry(): Promise<string> {
    if (cachedCountry) {
        return cachedCountry;
    }

    try {
        // Tentar detectar via API gratuita ipapi.co
        const response = await fetch('https://ipapi.co/json/', {
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            cachedCountry = data.country_code || 'US';
            console.log('🌍 País detectado:', cachedCountry, data.country_name);
            return cachedCountry as string;
        }
    } catch (error) {
        console.warn('⚠️ Erro ao detectar país, usando padrão USD:', error);
    }

    // Fallback: tentar detectar via timezone
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Sao_Paulo') ||
            timezone.includes('Brasilia') ||
            timezone.includes('Fortaleza') ||
            timezone.includes('Manaus') ||
            timezone.includes('Cuiaba') ||
            timezone.includes('Recife') ||
            timezone.startsWith('America/Araguaina') ||
            timezone.startsWith('America/Bahia') ||
            timezone.startsWith('America/Belem') ||
            timezone.startsWith('America/Boa_Vista') ||
            timezone.startsWith('America/Campo_Grande') ||
            timezone.startsWith('America/Maceio') ||
            timezone.startsWith('America/Porto_Velho') ||
            timezone.startsWith('America/Rio_Branco')) {
            cachedCountry = 'BR';
            return cachedCountry;
        }
    } catch (error) {
        console.warn('⚠️ Erro ao detectar timezone:', error);
    }

    // Fallback final: USD
    cachedCountry = 'US';
    return cachedCountry;
}

/**
 * Retorna preços baseados no país do usuário
 */
export async function getRegionalPricing(): Promise<RegionalPrice> {
    const countryCode = await detectUserCountry();

    // 🇧🇷 Brasil
    if (countryCode === 'BR') {
        return {
            currency: 'BRL',
            symbol: 'R$',
            monthly: 50.00,
            annual: 449.95,
            lifetime: 999.90,
            annualOriginal: 600.00,
            lifetimeOriginal: 1799.90,
            countryCode: 'BR',
            countryName: 'Brasil',
            isPromotional: true
        };
    }

    // 🇺🇸 USA e resto do mundo
    return {
        currency: 'USD',
        symbol: '$',
        monthly: 10.00,
        annual: 89.99,
        lifetime: 199.99,
        annualOriginal: 120.00,
        lifetimeOriginal: 359.99,
        countryCode,
        countryName: countryCode === 'US' ? 'United States' : 'International',
        isPromotional: true
    };
}

/**
 * Formata valor monetário com símbolo correto
 */
export function formatPrice(amount: number, currency: 'USD' | 'BRL'): string {
    const symbol = currency === 'BRL' ? 'R$' : '$';
    return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Calcula economia do plano anual
 */
export function calculateSavings(monthly: number, annual: number): number {
    return (monthly * 12) - annual;
}

/**
 * Calcula porcentagem de desconto
 */
export function calculateDiscount(original: number, current: number): number {
    return Math.round(((original - current) / original) * 100);
}
