const fetch = require('node-fetch');
async function test() {
  const url = 'https://xzenpress.com/.netlify/functions/ai-chat';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'sinusite' })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
