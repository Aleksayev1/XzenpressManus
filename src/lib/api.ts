/**
 * Retorna a URL base absoluta para requisições de API.
 * Suporta desenvolvimento local, subdomínios do Netlify de staging e o domínio de produção.
 */
export const getBaseApiUrl = (): string => {
    if (typeof window === 'undefined') return '';
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se for mobile nativo real rodando localmente (capacitor:// ou file://)
    const isNativeMobileProtocol = protocol === 'capacitor:' || protocol === 'file:';
    
    // Se for localhost/IP local no desenvolvimento web
    const isLocalhost = hostname === 'localhost' || 
                        hostname === '127.0.0.1' || 
                        hostname.startsWith('192.168.') || 
                        hostname.startsWith('10.');
                        
    if (isLocalhost && !isNativeMobileProtocol) {
        return '';
    }
    
    // Se estiver no navegador (web normal ou webview remota), o origin atual é sempre o correto e evita CORS
    if (!isNativeMobileProtocol) {
        return window.location.origin;
    }
    
    // Se for mobile nativo real carregando arquivos locais (ex: capacitor://localhost),
    // precisamos de uma URL absoluta ativa para acessar o backend das Netlify Functions.
    return 'https://xzenpressbolt.netlify.app';
};
