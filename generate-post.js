// Netlify Function to generate posts via Claude API
// This runs on the server, so no CORS issues

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { category, topic, apiKey } = JSON.parse(event.body);

    if (!apiKey) {
      return {
        statusCode: 400,
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

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: contentPrompts[category] || `Write a post about ${topic} for ${category}`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'API call failed', 
          details: errorData 
        })
      };
    }

    const data = await response.json();
    const generatedPost = data.content[0].text;

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
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
