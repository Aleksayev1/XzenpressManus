import { useState } from 'react';
import './GoogleTranslate.css';

export const GoogleTranslateWidget = () => {
    const [, setTranslating] = useState(false);

    const translatePage = async (targetLang: string) => {
        // Verificação de Localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            alert('⚠️ AVISO DE DESENVOLVIMENTO:\n\nO Google Translate via URL não consegue acessar "localhost" (seu computador).\n\nPara testar a tradução, publique o site no Netlify ou use um túnel (ngrok).\n\nIsso funcionará perfeitamente quando o site estiver online!');
            setTranslating(false);
            return;
        }

        setTranslating(true);

        // Método 1: Tentar usar a API nativa do Chrome (Translation API)
        if ('chrome' in window && (window as any).chrome?.i18n) {
            console.log('Using Chrome Translation API');
            window.location.href = `https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${encodeURIComponent(window.location.href)}`;
            return;
        }

        // Método 2: Fallback para redirecionamento direto do Google
        const currentUrl = encodeURIComponent(window.location.href);
        window.open(`https://translate.google.com/translate?sl=pt&tl=${targetLang}&u=${currentUrl}`, '_blank');
        setTranslating(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
                onChange={(e) => {
                    if (e.target.value) {
                        translatePage(e.target.value);
                        e.target.value = ''; // Reset
                    }
                }}
                style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    minWidth: '140px'
                }}
            >
                <option value="">🌐 Selecionar idioma / Select Language</option>
                <option value="en">🇺🇸 English (Inglês)</option>
                <option value="es">🇪🇸 Español (Espanhol)</option>
                <option value="zh-CN">🇨🇳 中文 (Chinês Simplificado)</option>
                <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                <option value="ar">🇸🇦 العربية (Árabe)</option>
                <option value="fr">🇫🇷 Français (Francês)</option>
                <option value="bn">🇧🇩 বাংলা (Bengali)</option>
                <option value="ru">🇷🇺 Русский (Russo)</option>
                <option value="pt">🇵🇹 Português (Português)</option>
                <option value="ur">🇵🇰 اردو (Urdu)</option>
                <option value="id">🇮🇩 Bahasa Indonesia (Indonésio)</option>
                <option value="de">🇩🇪 Deutsch (Alemão)</option>
                <option value="ja">🇯🇵 日本語 (Japonês)</option>
                <option value="tr">🇹🇷 Türkçe (Turco)</option>
                <option value="vi">🇻🇳 Tiếng Việt (Vietnamita)</option>
                <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                <option value="mr">🇮🇳 मराठी (Marathi)</option>
                <option value="ko">🇰🇷 한국어 (Coreano)</option>
                <option value="it">🇮🇹 Italiano (Italiano)</option>
                <option value="th">🇹🇭 ไทย (Tailandês)</option>
            </select>
        </div>
    );
};
