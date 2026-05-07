// Netlify Function to generate posts via Claude API
// Updated to work in Node.js environment

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { category, topic, apiKey } = JSON.parse(event.body);

    if (!apiKey) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'API key required' })
      };
    }

    // Content generation prompts
    const contentPrompts = {
      'A16z Scout Bait': `Write a short X/Twitter post (max 280 chars) from @Furqs7's perspective about ${topic}. 

Furqs7 is a Dubai-based founder (Kliqfi, prev Ordbit exit, 8+ yrs fintech/crypto). Mix of Elon's contrarian energy + Zack's investigative receipts + Raj's storytelling + Kanye's confidence + Joe Rogan's conversational flow.

Goals: Attract A16z scouts, show founder credibility, demonstrate market insight.

Style:
- Conversational, edgy, smart
- Use "rn", "btw", "lol" naturally  
- Short sentences for impact
- End with question or hook
- NO corporate speak
- Show deep knowledge casually`,

      'Stablecoins/Kliqfi': `Write an X post about ${topic} that subtly promotes Kliqfi's real-world crypto payment use case.

@Furqs7 personality: Dubai founder, 8+ yrs fintech/crypto, building Kliqfi for actual utility not speculation.

Focus on:
- Real business needs (instant settlement, low fees, regulatory clarity)
- Stablecoin adoption for payments
- Why "boring" utility wins long-term
- Kliqfi solving real problems

Style: Contrarian, practical, anti-hype, founder-focused.`,

      'Crypto Rage Bait': `Write a spicy, controversial take on ${topic} for crypto Twitter.

@Furqs7 voice: No BS, calls out LARPers, 8 years in the game, has actual exit.

Make it:
- Contrarian but defensible
- Slightly provocative
- Ends with "change my mind" or similar engagement hook
- 2-3 sentences max`,

      'AI Insights': `Write an X post about ${topic} showing deep technical understanding but accessible explanation.

@Furqs7 = Dubai founder who actually uses/builds with AI, not just tweets about it.

Style:
- "Just spent X hours with [AI tool]..." (hands-on credibility)
- One key insight that's not obvious
- Implication for builders/businesses
- Urgency without fearmongering`,

      'Dubai Lifestyle': `Write a post about ${topic} that showcases Dubai founder lifestyle.

@Furqs7 persona: Building in Dubai, appreciates luxury but focused on work, respects UAE government, people person.

Could include:
- Early morning routines
- Dubai skyline/locations
- MENA tech ecosystem advantage
- Work-life integration (not balance)
- Gratitude for UAE opportunities

Style: Aspirational but authentic, not flexing just stating facts.`,

      'Personal/Relatable': `Write a relatable post about ${topic} from a founder's perspective.

@Furqs7 = Real person, founder struggles, meditation/wellness advocate, people person.

Topics could be:
- Meditation practice
- Founder mental health
- Work-life challenges
- Personal growth
- Shopping/lifestyle choices
- Real estate thoughts

Style: Vulnerable but strong, relatable, human.`
    };

    console.log('Calling Anthropic API for category:', category, 'topic:', topic);

    // Call Claude API using https module (built into Node.js)
    const https = require('https');
    
    const postData = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: contentPrompts[category] || `Write a post about ${topic} for ${category}`
      }]
    });

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

    const apiResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API responded with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    const generatedPost = apiResponse.content[0].text;

    console.log('Successfully generated post');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        content: generatedPost,
        category,
        topic
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: error.toString()
      })
    };
  }
};
