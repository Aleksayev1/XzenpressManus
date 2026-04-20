require('dotenv').config();
const handler = require('./netlify/functions/ai-chat.js').handler;

async function runTest() {
    console.log('Testing with real env key...');
    const mockEvent = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({
            message: 'Olá, me diga o seu nome.',
            conversationHistory: [],
            userEmail: 'test@example.com'
        })
    };
    try {
        const response = await handler(mockEvent, {});
        console.log('Response Status:', response.statusCode);
        console.log('Response Body:', response.body);
    } catch(err) {
        console.error('Crash!', err);
    }
}
runTest();
