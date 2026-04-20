const handler = require('./netlify/functions/ai-chat.js').handler;

async function runTest() {
    console.log('Testing ai-chat function...');
    const mockEvent = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({
            message: 'Olá, me dê uma recomendação para dor de cabeça.',
            conversationHistory: [],
            userEmail: 'test@example.com'
        })
    };
    
    // Simulate env vars
    process.env.GEMINI_API_KEY = 'AIzaSyCUb9NhnZj2FNSe2_4dKODRfKWK312KLKl'; // Fake testing key format to see if it even reaches fetch
    // Replace fetch with a mock to prevent actual requests if you want, but letting it fail with 400 from Gemini is fine.
    
    try {
        const response = await handler(mockEvent, {});
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);
    } catch(err) {
        console.error('Function crashed!', err);
    }
}
runTest();
