import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

const GoogleTranslate: React.FC = () => {
    const isInitialized = useRef(false);

    useEffect(() => {
        // Function to initialize the widget
        const initWidget = () => {
            if (window.google && window.google.translate && document.getElementById('google_translate_element')) {
                try {
                    // Clear content to prevent duplicates on re-render
                    const element = document.getElementById('google_translate_element');
                    if (element) element.innerHTML = '';

                    new window.google.translate.TranslateElement({
                        pageLanguage: 'pt',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false
                    }, 'google_translate_element');

                    isInitialized.current = true;
                } catch (e) {
                    console.error('Google Translate Init Error:', e);
                }
            }
        };

        // If script is already loaded, init immediately
        if (window.google && window.google.translate) {
            initWidget();
        } else {
            // Otherwise, wait for the global callback
            window.googleTranslateElementInit = initWidget;
        }

        // Safety check: if script loaded but callback missed (race condition), poll briefly
        const intervalId = setInterval(() => {
            if (window.google && window.google.translate && !isInitialized.current) {
                initWidget();
                clearInterval(intervalId);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
            // We don't remove the script tag as it's global
        };
    }, []); // Run once on mount

    return (
        <div
            id="google_translate_element"
            className="ml-4 hidden md:block"
            style={{ minHeight: '40px', minWidth: '120px' }} // Reserve space to prevent layout shift
        />
    );
};

export default GoogleTranslate;
