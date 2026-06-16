/**
 * Retorna a URL base absoluta para requisições de API em produção
 * para evitar problemas de segurança/SSL em navegadores como Avast.
 * Em ambiente local (localhost), mantém URLs relativas para testes locais.
 */
export const getBaseApiUrl = (): string => {
    if (typeof window === 'undefined') return '';
    
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '127.0.51' || 
                        window.location.hostname.startsWith('192.168.') || 
                        window.location.hostname.startsWith('10.');
                        
    return isLocalhost ? '' : 'https://xzenpress.com';
};
