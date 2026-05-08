exports.handler = async (event, context) => {
  // Add detailed logging
  console.log('Function called!');
  console.log('Method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('Request body:', { category: body.category, topic: body.topic, hasApiKey: !!body.apiKey });
    
    const { category, topic, apiKey } = body;
    
    if (!apiKey) {
      console.log('No API key provided');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key required' })
      };
    }

    const prompts = {
      'A16z Scout Bait': `Write a short X post (max 280 chars) from @Furqs7 about ${topic}. Dubai founder. Attract A16z scouts. Conversational, edgy. End with question.`,
      'Stablecoins/Kliqfi': `X post about ${topic} promoting Kliqfi. Real business needs. Contrarian.`,
      'Crypto Rage Bait': `Controversial ${topic} take. Provocative. 2-3 sentences.`,
      'AI Insights': `X post about ${topic}. Hands-on credibility. Implications for builders.`,
      'Dubai Lifestyle': `${topic} Dubai founder post. Morning routines. Authentic.`,
      'Personal/Relatable': `Relatable ${topic} founder post. Vulnerable but strong.`
    };

    console.log('Calling Anthropic API...');
    
    const https = require('https');
    const postData = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
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
        console.log('API Response status:', res.statusCode);
        
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('API Response:', data.substring(0, 200));
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Failed to parse API response: ' + e.message));
            }
          } else {
            reject(new Error(`API returned ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        console.error('Request error:', e);
        reject(e);
      });

      req.write(postData);
      req.end();
    });

    console.log('Successfully got API response');

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
    console.error('Function error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Internal error',
        message: error.message,
        details: error.toString()
      })
    };
  }
};
