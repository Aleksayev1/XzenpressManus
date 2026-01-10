import { useEffect } from 'react';
import './GoogleTranslate.css';

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export const GoogleTranslateWidget = () => {
    useEffect(() => {
        // Define the initialization function globally
        window.googleTranslateElementInit = () => {
            // 🌍 AUTO-DETECT & ACTIVATE STRATEGY
            // Checks browser language and forces translation if visitor is likely foreign
            try {
                const userLang = navigator.language || (navigator as any).userLanguage;
                const langCode = userLang ? userLang.split('-')[0] : 'pt';

                // If language is NOT Portuguese and we haven't set a preference yet
                if (langCode !== 'pt' && document.cookie.indexOf('googtrans') === -1) {

                    // Map special cases or just use the code
                    let targetLang = langCode;
                    if (langCode === 'zh') targetLang = 'zh-CN';

                    // Check if strictly supported to avoid errors
                    const supported = 'en,es,fr,de,it,ru,zh-CN,ja,ko,ar,hi,bn,ur,id,tr,vi,te,mr,th'.split(',');

                    if (supported.includes(targetLang)) {
                        console.log(`🌍 Detected foreign visitor (${langCode}). Activating auto-translation to ${targetLang}...`);

                        // Set the Google Translate cookie to force rendering in target language
                        // Format: /source/target
                        document.cookie = `googtrans=/pt/${targetLang}; path=/`;
                        document.cookie = `googtrans=/pt/${targetLang}; path=/; domain=.${window.location.hostname}`;
                    }
                }
            } catch (e) {
                console.warn('Auto-translate detection failed:', e);
            }

            if (window.google && window.google.translate) {
                try {
                    // Give the DOM a moment to be ready
                    setTimeout(() => {
                        const element = document.getElementById('google_translate_element');
                        if (element) {
                            // Clear any existing content
                            element.innerHTML = '';

                            console.log('🔧 Initializing Google Translate with languages:', 'en,es,fr,de,it,ru,zh-CN,ja,ko,ar,hi,bn,ur,id,tr,vi,te,mr,th');

                            // Initialize the widget
                            new window.google.translate.TranslateElement(
                                {
                                    pageLanguage: 'pt',
                                    includedLanguages: 'en,es,fr,de,it,ru,zh-CN,ja,ko,ar,hi,bn,ur,id,tr,vi,te,mr,th,nl,sv,pl',
                                    layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL
                                },
                                'google_translate_element'
                            );

                            console.log('✅ Google Translate initialized successfully');
                        } else {
                            console.error('❌ Element google_translate_element not found');
                        }
                    }, 100);
                } catch (error) {
                    console.error('❌ Error initializing Google Translate:', error);
                }
            }
        };

        // Check if script already exists
        const existingScript = document.getElementById('google-translate-script');

        if (!existingScript) {
            // Create and inject the script
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            script.onerror = () => {
                console.error('❌ Failed to load Google Translate script');
            };
            document.body.appendChild(script);
            console.log('📥 Google Translate script injected');
        } else if (window.google && window.google.translate) {
            // Script already loaded, just initialize
            window.googleTranslateElementInit();
        }

        return () => {
            // Cleanup on unmount (optional)
        };
    }, []);

    return (
        <div
            id="google_translate_element"
            className="google-translate-container"
            style={{
                display: 'inline-block',
                minHeight: '30px',
                minWidth: '150px'
            }}
        />
    );
};
