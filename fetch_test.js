const fetch = require('node-fetch');

async function testKey() {
    try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCUb9NhnZj2FNSe2_4dKODRfKWK312KLKI';
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'sinusite' }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 1200 }
            })
        });
        
        console.log('STATUS:', res.status);
        console.log('RESPONSE:', await res.text());
    } catch (e) {
        console.log('ERROR:', e.message);
    }
}
testKey();
