/**
 * Retorna a URL base absoluta para requisições de API.
 * Suporta desenvolvimento local, subdomínios do Netlify de staging e o domínio de produção.
 */
export const getBaseApiUrl = (): string => {
    if (typeof window === 'undefined') return 'https://dulcet-conkies-0f1f56.netlify.app';
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se for mobile nativo real rodando localmente (capacitor:// ou file://)
    const isNativeMobileProtocol = protocol === 'capacitor:' || protocol === 'file:';
    
    // Se for localhost/IP local no desenvolvimento web (porta 5173 não roda Netlify functions)
    const isLocalhost = hostname === 'localhost' || 
                        hostname === '127.0.0.1' || 
                        hostname.startsWith('192.168.') || 
                        hostname.startsWith('10.');
                        
    if (isLocalhost || isNativeMobileProtocol) {
        // Redireciona para o backend ativo do Netlify que possui as serverless functions e CORS liberado
        return 'https://dulcet-conkies-0f1f56.netlify.app';
    }
    
    // Se estiver no navegador rodando no Netlify ou domínio próprio
    return window.location.origin;
};
