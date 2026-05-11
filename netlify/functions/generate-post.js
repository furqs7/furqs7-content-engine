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
      'A16z Scout Bait': `Write a short X post (max 280 chars) from @Furqs7 about ${topic}. Dubai founder, 8+ yrs fintech/crypto. Mix Elon's contrarian energy + Zack's receipts + Raj's storytelling. Attract A16z scouts. Conversational, edgy, smart. End with question. NO HASHTAGS.`,
      'Stablecoins/Kliqfi': `X post about ${topic} promoting Kliqfi real-world crypto payments. Real business needs: instant settlement, low fees. Contrarian, anti-hype. NO HASHTAGS.`,
      'Crypto Rage Bait': `Controversial ${topic} take for crypto Twitter. No BS, calls out LARPers. Provocative. End with engagement hook. 2-3 sentences. NO HASHTAGS.`,
      'AI Insights': `X post about ${topic}. Hands-on credibility with AI. One non-obvious insight. Implications for builders. NO HASHTAGS.`,
      'Dubai Lifestyle': `${topic} post showing Dubai founder lifestyle. Morning routines, MENA ecosystem. Aspirational but authentic. NO HASHTAGS.`,
      'Personal/Relatable': `Relatable ${topic} founder post. Struggles, wellness. Vulnerable but strong. NO HASHTAGS.`
    };

    const https = require('https');
    const postData = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompts[category] || `Write about ${topic}. NO HASHTAGS.` }]
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
    
    // Generate designed flyer with visual elements
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
  const templates = {
    'A16z Scout Bait': generateA16zFlyer(postText),
    'Stablecoins/Kliqfi': generateKliqfiFlyer(postText),
    'Crypto Rage Bait': generateRageBaitFlyer(postText),
    'AI Insights': generateAIFlyer(postText),
    'Dubai Lifestyle': generateDubaiFlyer(postText),
    'Personal/Relatable': generatePersonalFlyer(postText)
  };

  return templates[category] || templates['A16z Scout Bait'];
}

function generateA16zFlyer(text) {
  const keyPhrase = extractKeyPhrase(text, 25);
  
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#000000"/>
    
    <!-- Background geometric elements -->
    <circle cx="150" cy="150" r="80" fill="none" stroke="#FF6B35" stroke-width="2" opacity="0.3"/>
    <circle cx="930" cy="930" r="100" fill="none" stroke="#00D9FF" stroke-width="2" opacity="0.3"/>
    <rect x="800" y="100" width="150" height="150" fill="none" stroke="#FF6B35" stroke-width="2" opacity="0.2" transform="rotate(45 875 175)"/>
    
    <!-- Upward trending chart icon -->
    <g transform="translate(200, 300)">
      <polyline points="0,100 100,60 200,80 300,20 400,10" fill="none" stroke="#00D9FF" stroke-width="8" stroke-linecap="round"/>
      <circle cx="0" cy="100" r="12" fill="#00D9FF"/>
      <circle cx="100" cy="60" r="12" fill="#00D9FF"/>
      <circle cx="200" cy="80" r="12" fill="#00D9FF"/>
      <circle cx="300" cy="20" r="12" fill="#FF6B35"/>
      <circle cx="400" cy="10" r="16" fill="#FF6B35"/>
      <polygon points="380,10 420,10 400,-10" fill="#FF6B35"/>
    </g>
    
    <!-- Main text -->
    <text x="540" y="600" font-family="Arial, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(keyPhrase)}</text>
    
    <!-- A16Z badge -->
    <g transform="translate(540, 750)">
      <rect x="-100" y="-30" width="200" height="60" fill="#FF6B35" rx="8"/>
      <text x="0" y="10" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#000000" text-anchor="middle">A16Z SCOUT</text>
    </g>
  </svg>`;
}

function generateKliqfiFlyer(text) {
  const keyPhrase = extractKeyPhrase(text, 30);
  
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#000000"/>
    
    <!-- Background elements -->
    <circle cx="100" cy="980" r="120" fill="#FF6B35" opacity="0.1"/>
    <circle cx="980" cy="100" r="100" fill="#00D9FF" opacity="0.1"/>
    
    <!-- Coin stack illustration -->
    <g transform="translate(540, 280)">
      <ellipse cx="-80" cy="0" rx="60" ry="20" fill="#FF6B35" opacity="0.8"/>
      <ellipse cx="-80" cy="-20" rx="60" ry="20" fill="#FF6B35"/>
      <rect x="-140" y="-60" width="120" height="60" fill="#FF6B35"/>
      <ellipse cx="-80" cy="-60" rx="60" ry="20" fill="#FF8855"/>
      
      <ellipse cx="0" cy="20" rx="60" ry="20" fill="#00D9FF" opacity="0.8"/>
      <ellipse cx="0" cy="0" rx="60" ry="20" fill="#00D9FF"/>
      <rect x="-60" y="-80" width="120" height="80" fill="#00D9FF"/>
      <ellipse cx="0" cy="-80" rx="60" ry="20" fill="#33E0FF"/>
      
      <ellipse cx="80" cy="10" rx="60" ry="20" fill="#FF6B35" opacity="0.8"/>
      <ellipse cx="80" cy="-10" rx="60" ry="20" fill="#FF6B35"/>
      <rect x="20" y="-50" width="120" height="50" fill="#FF6B35"/>
      <ellipse cx="80" cy="-50" rx="60" ry="20" fill="#FF8855"/>
    </g>
    
    <!-- Arrow pointing right (payment flow) -->
    <g transform="translate(540, 480)">
      <line x1="-150" y1="0" x2="150" y2="0" stroke="#00D9FF" stroke-width="6"/>
      <polygon points="130,-20 170,0 130,20" fill="#00D9FF"/>
    </g>
    
    <!-- Main text -->
    <text x="540" y="640" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(keyPhrase)}</text>
    
    <!-- KLIQFI badge -->
    <g transform="translate(540, 820)">
      <rect x="-120" y="-35" width="240" height="70" fill="none" stroke="#FF6B35" stroke-width="4" rx="8"/>
      <text x="0" y="12" font-family="Arial, sans-serif" font-size="36" font-weight="900" fill="#FF6B35" text-anchor="middle">KLIQFI</text>
    </g>
  </svg>`;
}

function generateRageBaitFlyer(text) {
  const numberMatch = text.match(/\d+%|\d+x|\d+/);
  const number = numberMatch ? numberMatch[0] : '99%';
  const keyPhrase = extractKeyPhrase(text.replace(number, ''), 20);
  
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#000000"/>
    
    <!-- Warning stripes background -->
    <rect x="0" y="80" width="1080" height="60" fill="#FF6B35" opacity="0.15"/>
    <rect x="0" y="200" width="1080" height="60" fill="#FF6B35" opacity="0.15"/>
    <rect x="0" y="820" width="1080" height="60" fill="#FF6B35" opacity="0.15"/>
    <rect x="0" y="940" width="1080" height="60" fill="#FF6B35" opacity="0.15"/>
    
    <!-- Alert icon -->
    <g transform="translate(540, 250)">
      <polygon points="0,-80 80,80 -80,80" fill="none" stroke="#FF6B35" stroke-width="8"/>
      <circle cx="0" cy="30" r="12" fill="#FF6B35"/>
      <rect x="-8" y="-30" width="16" height="50" fill="#FF6B35"/>
    </g>
    
    <!-- Big number -->
    <text x="540" y="550" font-family="Arial, sans-serif" font-size="180" font-weight="900" fill="#FF6B35" text-anchor="middle">${escapeXml(number)}</text>
    
    <!-- Subtitle -->
    <text x="540" y="680" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF" text-anchor="middle">${escapeXml(keyPhrase)}</text>
    
    <!-- Bottom accent -->
    <line x1="200" y1="850" x2="880" y2="850" stroke="#00D9FF" stroke-width="6"/>
  </svg>`;
}

function generateAIFlyer(text) {
  const keyPhrase = extractKeyPhrase(text, 28);
  
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#000000"/>
    
    <!-- Neural network visualization -->
    <g transform="translate(540, 280)">
      <!-- Layer 1 -->
      <circle cx="-200" cy="-60" r="18" fill="#00D9FF"/>
      <circle cx="-200" cy="0" r="18" fill="#00D9FF"/>
      <circle cx="-200" cy="60" r="18" fill="#00D9FF"/>
      
      <!-- Layer 2 -->
      <circle cx="0" cy="-80" r="18" fill="#FF6B35"/>
      <circle cx="0" cy="-20" r="18" fill="#FF6B35"/>
      <circle cx="0" cy="40" r="18" fill="#FF6B35"/>
      <circle cx="0" cy="100" r="18" fill="#FF6B35"/>
      
      <!-- Layer 3 -->
      <circle cx="200" cy="-40" r="18" fill="#00D9FF"/>
      <circle cx="200" cy="20" r="18" fill="#00D9FF"/>
      <circle cx="200" cy="80" r="18" fill="#00D9FF"/>
      
      <!-- Connections (simplified) -->
      <line x1="-182" y1="-60" x2="-18" y2="-80" stroke="#FF6B35" stroke-width="2" opacity="0.3"/>
      <line x1="-182" y1="0" x2="-18" y2="-20" stroke="#FF6B35" stroke-width="2" opacity="0.6"/>
      <line x1="-182" y1="60" x2="-18" y2="40" stroke="#FF6B35" stroke-width="2" opacity="0.3"/>
      
      <line x1="18" y1="-80" x2="182" y2="-40" stroke="#00D9FF" stroke-width="2" opacity="0.3"/>
      <line x1="18" y1="-20" x2="182" y2="20" stroke="#00D9FF" stroke-width="3" opacity="0.8"/>
      <line x1="18" y1="40" x2="182" y2="80" stroke="#00D9FF" stroke-width="2" opacity="0.4"/>
    </g>
    
    <!-- Main text -->
    <text x="540" y="600" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(keyPhrase)}</text>
    
    <!-- AI badge -->
    <g transform="translate(540, 800)">
      <rect x="-80" y="-30" width="160" height="60" fill="#00D9FF" rx="30"/>
      <text x="0" y="10" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#000000" text-anchor="middle">AI</text>
    </g>
  </svg>`;
}

function generateDubaiFlyer(text) {
  const keyPhrase = extractKeyPhrase(text, 25);
  
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#000000"/>
    
    <!-- Skyline silhouette -->
    <g transform="translate(0, 700)">
      <rect x="100" y="-200" width="60" height="200" fill="#FF6B35" opacity="0.3"/>
      <rect x="200" y="-280" width="70" height="280" fill="#FF6B35" opacity="0.4"/>
      <rect x="310" y="-350" width="80" height="350" fill="#FF6B35" opacity="0.5"/>
      <rect x="430" y="-420" width="90" height="420" fill="#FF6B35" opacity="0.6"/>
      <polygon points="475,-420 475,-480 520,-450" fill="#FF6B35" opacity="0.7"/>
      <rect x="560" y="-380" width="85" height="380" fill="#FF6B35" opacity="0.5"/>
      <rect x="680" y="-310" width="75" height="310" fill="#FF6B35" opacity="0.4"/>
      <rect x="790" y="-250" width="65" height="250" fill="#FF6B35" opacity="0.3"/>
      <rect x="890" y="-180" width="55" height="180" fill="#FF6B35" opacity="0.3"/>
    </g>
    
    <!-- Sun/gradient circle -->
    <circle cx="200" cy="200" r="100" fill="#FF6B35" opacity="0.2"/>
    <circle cx="200" cy="200" r="70" fill="#FF6B35" opacity="0.3"/>
    <circle cx="200" cy="200" r="40" fill="#FF6B35" opacity="0.5"/>
    
    <!-- Main text -->
    <text x="540" y="380" font-family="Arial, sans-serif" font-size="50" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(keyPhrase)}</text>
    
    <!-- DUBAI label -->
    <g transform="translate(540, 520)">
      <text x="0" y="0" font-family="Arial, sans-serif" font-size="64" font-weight="900" fill="#00D9FF" text-anchor="middle">DUBAI</text>
    </g>
  </svg>`;
}

function generatePersonalFlyer(text) {
  const keyPhrase = extractKeyPhrase(text, 30);
  
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#000000"/>
    
    <!-- Organic flowing shapes -->
    <g opacity="0.15">
      <ellipse cx="200" cy="300" rx="150" ry="100" fill="#00D9FF" transform="rotate(-30 200 300)"/>
      <ellipse cx="880" cy="800" rx="180" ry="120" fill="#FF6B35" transform="rotate(20 880 800)"/>
      <circle cx="850" cy="250" r="90" fill="#00D9FF"/>
    </g>
    
    <!-- Heart icon made of circles -->
    <g transform="translate(540, 320)">
      <circle cx="-40" cy="-20" r="50" fill="#FF6B35"/>
      <circle cx="40" cy="-20" r="50" fill="#FF6B35"/>
      <polygon points="0,70 -85,-10 85,-10" fill="#FF6B35"/>
    </g>
    
    <!-- Main text -->
    <text x="540" y="580" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#FFFFFF" text-anchor="middle">${escapeXml(keyPhrase)}</text>
    
    <!-- Quote accent -->
    <text x="200" y="720" font-family="Georgia, serif" font-size="120" fill="#00D9FF" opacity="0.3">"</text>
    <text x="880" y="780" font-family="Georgia, serif" font-size="120" fill="#00D9FF" opacity="0.3">"</text>
  </svg>`;
}

function extractKeyPhrase(text, maxLength) {
  // Clean the text
  let cleaned = text
    .replace(/https?:\/\/\S+/g, '') // Remove URLs
    .replace(/[@#]\w+/g, '') // Remove mentions and hashtags
    .trim();
  
  // Get first meaningful sentence or phrase
  const firstSentence = cleaned.split(/[.!?]/)[0];
  const words = firstSentence.split(' ').slice(0, 6).join(' ');
  
  return words.length > maxLength ? words.substring(0, maxLength - 3) + '...' : words;
}

function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
