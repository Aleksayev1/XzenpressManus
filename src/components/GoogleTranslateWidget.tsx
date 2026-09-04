import { useEffect } from 'react';

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export const GoogleTranslateWidget = () => {
    useEffect(() => {
        const initGoogleTranslate = () => {
            if (window.google && window.google.translate) {
                const el = document.getElementById('google_translate_element');
                if (el && !el.hasChildNodes()) {
                    try {
                        new window.google.translate.TranslateElement(
                            {
                                pageLanguage: 'pt',
                                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                                autoDisplay: false
                            },
                            'google_translate_element'
                        );
                    } catch (err) {
                        console.warn('Google Translate initialization error:', err);
                    }
                }
            }
        };

        window.googleTranslateElementInit = initGoogleTranslate;

        // Injetar o script apenas uma vez
        const id = 'google-translate-script';
        if (!document.getElementById(id)) {
            const script = document.createElement('script');
            script.id = id;
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google && window.google.translate) {
            initGoogleTranslate();
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
