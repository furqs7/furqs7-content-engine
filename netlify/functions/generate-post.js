exports.handler = async (event, context) => {
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

    const https = require('https');
    const postData = JSON.stringify({
      model: 'claude-sonnet-4-6',
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
            reject(new Error(`API ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    const postContent = apiResponse.content[0].text;
    
    // Generate minimal flyer SVG
    const flyer = generateFlyer(category, postContent);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        content: postContent, 
        category, 
        topic,
        flyer: flyer
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message
      })
    };
  }
};

function generateFlyer(category, postText) {
  // Extract key number or phrase from post
  const numberMatch = postText.match(/\d+%|\$\d+[BMK]?|\d+x|\d+\/\d+/);
  const mainNumber = numberMatch ? numberMatch[0] : extractKeyPhrase(postText);
  const subtitle = extractSubtitle(postText, mainNumber);

  // Simple, clean flyer - just number + subtitle
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#000000"/>
    
    <g transform="translate(540, 540)">
      
      <text x="0" y="-80" font-family="Arial, sans-serif" font-size="160" font-weight="900" fill="#FF6B35" text-anchor="middle" dominant-baseline="middle">${escapeXml(mainNumber)}</text>
      
      <line x1="-250" y1="40" x2="250" y2="40" stroke="#00D9FF" stroke-width="4"/>
      
      <text x="0" y="140" font-family="Arial, sans-serif" font-size="36" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${escapeXml(subtitle)}</text>
      
    </g>
  </svg>`;
}

function extractKeyPhrase(text) {
  const words = text.split(' ').filter(w => w.length > 3);
  if (words.length > 0) {
    return words[0].substring(0, 15).toUpperCase();
  }
  return 'INSIGHT';
}

function extractSubtitle(text, mainNumber) {
  const cleaned = text.replace(mainNumber, '').trim();
  const words = cleaned.split(' ').slice(0, 5).join(' ');
  return words.length > 50 ? words.substring(0, 47) + '...' : words;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
