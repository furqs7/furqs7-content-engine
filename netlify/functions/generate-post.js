exports.handler = async (event, context) => {
  console.log('Function called!');
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { category, topic, apiKey } = JSON.parse(event.body);
    
    if (!apiKey) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key required' })
      };
    }

    const prompts = {
      'A16z Scout Bait': `Write a short X post (max 280 chars) from @Furqs7 about ${topic}. Dubai founder, 8+ yrs fintech/crypto. Mix Elon's contrarian energy + Zack's receipts + Raj's storytelling. Attract A16z scouts. Conversational, edgy, smart. End with question.`,
      'Stablecoins/Kliqfi': `X post about ${topic} promoting Kliqfi real-world crypto payments. Real business needs: instant settlement, low fees. Contrarian, anti-hype.`,
      'Crypto Rage Bait': `Controversial ${topic} take for crypto Twitter. No BS, calls out LARPers. Provocative. End with engagement hook. 2-3 sentences.`,
      'AI Insights': `X post about ${topic}. Hands-on credibility with AI. One non-obvious insight. Implications for builders.`,
      'Dubai Lifestyle': `${topic} post showing Dubai founder lifestyle. Morning routines, MENA ecosystem. Aspirational but authentic.`,
      'Personal/Relatable': `Relatable ${topic} founder post. Struggles, wellness. Vulnerable but strong.`
    };

    console.log('Calling Anthropic API for:', category);
    
    const https = require('https');
    const postData = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',  // ← CHANGED THIS LINE
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompts[category] || `Write about ${topic}` }]
    });

    const apiResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        port: 443,
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API returned ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    console.log('Success! Generated post');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        content: apiResponse.content[0].text, 
        category, 
        topic 
      })
    };

  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Internal error',
        message: error.message
      })
    };
  }
};
