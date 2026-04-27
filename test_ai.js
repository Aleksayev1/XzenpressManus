const handler = require('./netlify/functions/ai-chat.js').handler;

async function runTest() {
    console.log('Testing ai-chat function...');
    const mockEvent = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({
            message: 'Ola, me de uma recomendacao',
            conversationHistory: [],
            userEmail: 'test@example.com'
        })
    };
    
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'SUA_CHAVE_AQUI'; 
    
    try {
        const response = await handler(mockEvent, {});
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);
    } catch(err) {
        console.error('Function crashed!', err);
    }
}
runTest();
