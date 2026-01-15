import { useEffect } from 'react';

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export const GoogleTranslateWidget = () => {
    useEffect(() => {
        // 1. Defunir a função de inicialização
        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'pt',
                        // 🌍 Top 30+ Línguas mais faladas e estratégicas
                        includedLanguages: 'en,zh-CN,hi,es,fr,ar,bn,pt,ru,ur,id,de,ja,pj,mr,te,tr,ta,vi,tl,ko,it,ha,th,kn,gu,fa,pl,uk,nl,sv,ro',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false
                    },
                    'google_translate_element'
                );
            }
        };

        // 2. Injetar o script apenas uma vez
        const id = 'google-translate-script';
        if (!document.getElementById(id)) {
            const script = document.createElement('script');
            script.id = id;
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google && window.google.translate) {
            window.googleTranslateElementInit();
        }

        return () => {
            // Limpeza opcional
        };
    }, []);

    return (
        <div
            id="google_translate_element"
            className="google-translate-container"
            style={{ minHeight: '40px' }}
        />
    );
};
