import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
class AIService {
  constructor() {
    // Use the new API key provided
    const apiKey = 'AIzaSyA0L3PTf4i0xMkBwTWjDLOaI0PBj5RPZo0';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Generate AI analysis for a client
  async analyzeClient(clientData) {
    try {
      const cacheKey = `client_analysis_${clientData.email}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const prompt = this.buildClientAnalysisPrompt(clientData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const analysis = this.parseAIResponse(text);
      
      // Cache the result
      this.setCache(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getFallbackAnalysis(clientData);
    }
  }

  // Generate AI chat response for junk removal
  async generateChatResponse(userMessage, conversationHistory = []) {
    try {
      console.log('AIService: Generating chat response for:', userMessage);
      console.log('AIService: Conversation history:', conversationHistory);
      
      const prompt = this.buildChatPrompt(userMessage, conversationHistory);
      console.log('AIService: Generated prompt length:', prompt.length);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('AIService: AI response received:', text);
      return text;
    } catch (error) {
      console.error('AIService: AI chat error:', error);
      console.error('AIService: Error details:', error.message);
      return this.getFallbackChatResponse(userMessage);
    }
  }

  // Build chat prompt for junk removal assistant
  buildChatPrompt(userMessage, conversationHistory = []) {
    const historyText = conversationHistory
      .slice(-3) // Last 3 messages for context
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');

    return `You are a helpful junk removal assistant for StoneRiver Junk Removal in Central Minnesota. You are friendly, professional, and focused ONLY on junk removal services.

STONE RIVER SERVICES:
- Residential: Furniture, appliances, garage cleanouts, basement/attic, estate cleanouts
- Commercial: Office cleanouts, retail removal, construction debris, property management  
- Demolition: Deck removal, shed demolition, interior demolition
- Service Area: Central Minnesota including St. Cloud, Minneapolis, Twin Cities, suburbs within 50 miles
- Pricing: 1/4 Truck $150, 1/2 Truck $250, 3/4 Truck $350, Full Truck $450
- Same-day service available (call before noon)
- Phone: (612) 685-4696
- Hours: Mon-Sat 7AM-7PM

ITEMS WE TAKE: Furniture, appliances, electronics, construction debris, yard waste, mattresses, carpets, metal, wood, concrete, bricks, hot tubs, sheds, decks
ITEMS WE DON'T TAKE: Paint, chemicals, oil, asbestos, hazardous materials

RESPONSE GUIDELINES:
- Be friendly and helpful with emojis
- Keep responses concise but informative
- Focus on junk removal ONLY - redirect other topics
- Include phone number for immediate help
- Use formatting with line breaks and bullet points
- Ask follow-up questions to engage customers
- Route to phone for same-day service

CONVERSATION HISTORY:
${historyText}

USER MESSAGE: ${userMessage}

Respond as the StoneRiver junk removal assistant:`;
  }

  // Fallback chat response - Enhanced to feel like real AI
  getFallbackChatResponse(userMessage) {
    console.log('AIService: Using enhanced fallback response for:', userMessage);
    
    const message = userMessage.toLowerCase();
    
    // Enhanced greeting with personality
    if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      const greetings = [
        "👋 Welcome to StoneRiver Junk Removal! I'm here to help with all your junk removal needs. What can I assist you with today?",
        "🚚 Hello! Thanks for reaching out to StoneRiver! I'm your junk removal expert. What items are you looking to remove?",
        "💪 Hi there! StoneRiver Junk Removal at your service! Whether it's a single item or a full cleanout, I've got you covered. What can I help you with?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Enhanced pricing with contextual details
    if (message.match(/quote|price|cost|how much|pricing|estimate|calculator/)) {
      let response = "💰 Let me help you with pricing! At StoneRiver, we offer transparent, competitive pricing:\n\n";
      
      // Add contextual pricing based on items mentioned
      if (message.match(/fridge|refrigerator|appliance/)) {
        response += "🧊 **For appliances like refrigerators:**\n• 1/4 Truck: $150 (single appliance)\n• 1/2 Truck: $250 (appliances + small items)\n\n";
      } else if (message.match(/furniture|couch|sofa|chair|table/)) {
        response += "🛋️ **For furniture removal:**\n• 1/4 Truck: $150 (few furniture pieces)\n• 1/2 Truck: $250 (room of furniture)\n• 3/4 Truck: $350 (multiple rooms)\n\n";
      } else {
        response += "• 1/4 Truck: $150 (small items, single room)\n• 1/2 Truck: $250 (medium cleanout, multiple rooms)\n• 3/4 Truck: $350 (large cleanout, entire home)\n• Full Truck: $450 (maximum load, estate cleanout)\n\n";
      }
      
      response += "💡 **Pro tip:** Our team can give you an exact quote on-site! What specific items do you need removed?";
      return response;
    }
    
    // Enhanced service area with local knowledge
    if (message.match(/area|location|where|serve|cover|central minnesota|st cloud|minneapolis|saint paul|twin cities/)) {
      let response = "📍 Great question! StoneRiver proudly serves Central Minnesota:\n\n";
      
      if (message.match(/minneapolis|saint paul|twin cities/)) {
        response += "✅ **YES! We serve Minneapolis & Twin Cities**\n• All Minneapolis suburbs\n• St. Paul and surrounding areas\n• Same-day service available!\n\n";
      } else if (message.match(/st cloud|st. cloud/)) {
        response += "✅ **St. Cloud is our home base!**\n• St. Cloud and all surrounding areas\n• Sauk Centre, Alexandria, Little Falls\n• Priority service for local customers\n\n";
      } else {
        response += "🗺️ **Our Service Area:**\n• St. Cloud & Central Minnesota\n• Minneapolis & Twin Cities metro\n• All suburbs within 50 miles\n• Same-day service available in most areas\n\n";
      }
      
      response += "🏠 What's your specific location? I can confirm we service your area and give you availability details!";
      return response;
    }
    
    // Enhanced scheduling with urgency
    if (message.match(/schedule|appointment|book|when|available|time|pickup|today|tomorrow|same day|asap|urgent/)) {
      let response = "📅 Let's get you scheduled! StoneRiver offers flexible scheduling:\n\n";
      
      if (message.match(/today|same day|asap|urgent|right now/)) {
        response += "⚡ **SAME-DAY SERVICE AVAILABLE!**\n📞 Call NOW: (612) 685-4696\n⏰ Call before noon for same-day pickup\n\n";
        response += "🚚 For same-day service, calling is fastest! Or I can schedule you for tomorrow. What's your address and what needs to be removed?";
      } else if (message.match(/tomorrow|next day/)) {
        response += "📅 **Next-day service available!**\n✅ Book online anytime\n📞 Call (612) 685-4696\n\n";
        response += "What date works best for you? What items need to be removed?";
      } else {
        response += "🕐 **Scheduling Options:**\n• Same-day: Call (612) 685-4696 before noon\n• Next-day: Available most days\n• Weekends: Yes, we work weekends!\n• Online booking: 24/7\n\n";
        response += "What date works best? What type of service do you need?";
      }
      return response;
    }
    
    // Enhanced services with detailed categories
    if (message.match(/service|services|what do you|remove|take|haul|cleanout|demolition|commercial|residential/)) {
      let response = "🚚 StoneRiver is your full-service junk removal expert! Here's what we can handle:\n\n";
      
      if (message.match(/residential|home|house|garage|basement|attic/)) {
        response += "🏠 **RESIDENTIAL SERVICES:**\n• Furniture & appliance removal\n• Garage, basement & attic cleanouts\n• Estate cleanouts & downsizing\n• Foreclosure cleanouts\n• Move-in/move-out cleaning\n\n";
      } else if (message.match(/commercial|business|office|retail|property/)) {
        response += "🏢 **COMMERCIAL SERVICES:**\n• Office cleanouts & relocations\n• Retail store removals\n• Construction site cleanup\n• Property management services\n• Warehouse cleanouts\n\n";
      } else if (message.match(/demolition|deck|shed|tear down|remove structure/)) {
        response += "🔨 **DEMOLITION SERVICES:**\n• Deck removal & disposal\n• Shed demolition & haul away\n• Interior demolition (walls, floors)\n• Concrete breaking & removal\n• Site preparation\n\n";
      } else {
        response += "🏠 **RESIDENTIAL:**\n• Furniture, appliances, electronics\n• Garage, basement, attic cleanouts\n• Estate cleanouts, downsizing\n\n🏢 **COMMERCIAL:**\n• Office cleanouts, retail removal\n• Construction debris, property management\n\n🔨 **DEMOLITION:**\n• Deck removal, shed demolition\n• Interior demolition, site prep\n\n";
      }
      
      response += "💪 Whatever you need removed, we've got the equipment and expertise! What type of service are you looking for?";
      return response;
    }
    
    // Enhanced items we take/don't take
    if (message.match(/take|remove|accept|what items|furniture|appliances|electronics|construction|yard waste|hazardous|paint|chemical/)) {
      let response = "♻️ Great question! Here's what StoneRiver can and cannot remove:\n\n";
      
      if (message.match(/hazardous|paint|chemical|oil|asbestos|dangerous/)) {
        response += "❌ **Items We DON'T Take:**\n• Paint, chemicals, solvents\n• Oil, gasoline, antifreeze\n• Asbestos, hazardous materials\n• Medical waste, biohazards\n\n";
        response += "🏢 **For hazardous items:**\nWe can recommend local hazardous waste facilities. Call (612) 685-4696 for guidance!\n\n";
      } else {
        response += "✅ **Items We DO Take:**\n• 🛋️ Furniture: couches, chairs, tables, beds\n• 📺 Appliances: refrigerators, washers, dryers, microwaves\n• 💻 Electronics: TVs, computers, stereos\n• 🔧 Construction: lumber, drywall, concrete, bricks\n• 🌿 Yard waste: branches, grass, leaves, soil\n• 🛏️ Household: mattresses, carpets, toys, clothes\n• 🏗️ Large items: hot tubs, sheds, decks, playsets\n\n";
        response += "❌ **Items We DON'T Take:**\n• Paint, chemicals, oils, asbestos\n• Medical waste, biohazards\n\n";
      }
      
      response += "🤔 What specific items do you need removed? I can give you a more precise estimate!";
      return response;
    }
    
    // Enhanced contact/phone responses
    if (message.match(/call|phone|contact|number|speak|human|person|talk|representative/)) {
      const responses = [
        "📞 Ready to talk to a human? Call our friendly team now!\n\n📱 (612) 685-4696\n⏰ Mon-Sat: 7AM-7PM\n\nOur junk removal experts are standing by to help with quotes, scheduling, and any questions you have!",
        "🗣️ Want to speak with a real person? I'd love to help, but our phone team can give you immediate assistance!\n\n📞 Call: (612) 685-4696\n⚡ Available: Mon-Sat 7AM-7PM\n\nThey can answer questions, give quotes, and schedule your pickup!",
        "👥 Need human assistance? Our team is awesome!\n\n📱 (612) 685-4696\n🕐 Hours: Mon-Sat 7AM-7PM\n\nWhether you need a quick quote or want to discuss your project in detail, we're here to help!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Enhanced thank you responses
    if (message.match(/thank|thanks|appreciate|good|great|awesome|amazing|helpful/)) {
      const responses = [
        "😊 You're very welcome! Making junk removal easy and stress-free is what we do best. Is there anything else I can help you with?",
        "🙏 Happy to help! We love making junk removal simple for our customers. What other questions do you have?",
        "💪 My pleasure! StoneRiver is here to make your junk removal project hassle-free. Need anything else?",
        "🎉 You're welcome! We're passionate about helping customers clear their space. What else can I assist you with?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Enhanced goodbye
    if (message.match(/bye|goodbye|see you|later|thanks bye|thank you bye/)) {
      const responses = [
        "👋 Thanks for chatting with StoneRiver! Remember:\n\n• 📞 Call (612) 685-4696 for immediate help\n• 🌐 Visit us online anytime\n• 🚚 We're here when you need us!\n\nHave a great day! 🌟",
        "🚚 It was great helping you today! StoneRiver is ready when you are:\n\n📞 (612) 685-4696 - Call anytime!\n📅 Online booking available 24/7\n\nTake care! 💪",
        "👋 Thanks for choosing StoneRiver Junk Removal! We're excited to help you clear your space. Don't hesitate to reach out!\n\n📞 (612) 685-4696\n\nHave a wonderful day! 😊"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Enhanced default response with more personality
    const responses = [
      `🤔 I understand you're asking about: "${userMessage}"! Let me help you with that! 🚚\n\nI'm your StoneRiver junk removal expert and I can help you with:\n\n• 💰 Getting a free, no-obligation quote\n• 📍 Checking if we service your area\n• 📅 Scheduling your junk removal\n• 🚚 Learning about our services\n• 📞 Connecting you with our team\n\nWhat specific junk removal service do you need today? I'm here to make it easy for you!`,
      `🚚 I'd love to help you with "${userMessage}"! As your StoneRiver junk removal assistant, I'm here to make your project simple and stress-free.\n\nI can assist with:\n• 💰 Accurate pricing estimates\n• 🗺️ Service area confirmation\n• 📅 Flexible scheduling options\n• 🛋️ All types of junk removal\n• 📞 Immediate help when needed\n\nWhat can I help you with today? Let's get your space cleared! 💪`,
      `🎯 I'm here to help with your junk removal needs! You mentioned: "${userMessage}"\n\nAt StoneRiver, we make junk removal easy with:\n• 💰 Transparent pricing\n• 📍 Central Minnesota service\n• 📅 Same-day availability\n• 🚚 All types of removal\n• 📞 Friendly customer service\n\nWhat specific junk removal project can I help you with today?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  async generateComprehensiveReport(clientData) {
    try {
      const prompt = this.buildComprehensiveReportPrompt(clientData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseComprehensiveReport(text);
    } catch (error) {
      console.error('AI report generation error:', error);
      return this.getFallbackReport(clientData);
    }
  }

  // Generate smart recommendations
  async generateRecommendations(clientData) {
    try {
      const prompt = this.buildRecommendationsPrompt(clientData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseRecommendations(text);
    } catch (error) {
      console.error('AI recommendations error:', error);
      return this.getFallbackRecommendations(clientData);
    }
  }

  // Predictive analytics
  async generatePredictions(clientData) {
    try {
      const prompt = this.buildPredictionsPrompt(clientData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parsePredictions(text);
    } catch (error) {
      console.error('AI predictions error:', error);
      return this.getFallbackPredictions(clientData);
    }
  }

  // Build prompts for different AI tasks
  buildClientAnalysisPrompt(clientData) {
    return `
You are an expert business analyst for a junk removal service company. Analyze the following client data and provide detailed insights:

Client Information:
- Name: ${clientData.name}
- Email: ${clientData.email}
- Phone: ${clientData.phone || 'Not provided'}
- Address: ${clientData.address || 'Not provided'}

Booking History:
- Total Bookings: ${clientData.bookings?.length || 0}
- Completed Bookings: ${clientData.bookings?.filter(b => b.status === 'completed').length || 0}
- Cancelled Bookings: ${clientData.bookings?.filter(b => b.status === 'cancelled').length || 0}

Financial Data:
- Total Spent: $${clientData.totalSpent || 0}
- Past Due Amount: $${clientData.pastDue || 0}
- Total Invoices: ${clientData.invoices?.length || 0}
- Paid Invoices: ${clientData.invoices?.filter(i => i.status === 'paid').length || 0}

Please provide:
1. Risk Score (0-100): Based on payment history, booking patterns, and account activity
2. Loyalty Score (0-100): Based on repeat business, total spending, and engagement
3. Engagement Score (0-100): Based on communication frequency and responsiveness
4. Key Insights: Behavioral patterns, opportunities, and risk factors
5. Brief summary of client profile

Format your response as JSON:
{
  "riskScore": number,
  "loyaltyScore": number,
  "engagementScore": number,
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "brief summary"
}
`;
  }

  buildComprehensiveReportPrompt(clientData) {
    return `
Generate a comprehensive business intelligence report for this junk removal service client:

${JSON.stringify(clientData, null, 2)}

Include:
1. Executive Summary
2. Risk Assessment (payment risk, churn risk, compliance risk)
3. Value Analysis (lifetime value, growth potential)
4. Behavioral Patterns (booking patterns, seasonal trends)
5. Recommendations (actionable insights, growth opportunities)
6. Predictive Analytics (next booking probability, preferred services)

Format as structured JSON with detailed analysis for each section.
`;
  }

  buildRecommendationsPrompt(clientData) {
    return `
Based on this client's data for a junk removal service, provide 5 specific, actionable recommendations:

${JSON.stringify(clientData, null, 2)}

Consider:
- Service optimization
- Communication improvements
- Upselling opportunities
- Retention strategies
- Risk mitigation

Format as JSON array of recommendation objects:
[
  {
    "category": "service|communication|retention|upselling|risk",
    "priority": "high|medium|low",
    "action": "specific actionable recommendation",
    "expectedOutcome": "expected result",
    "implementation": "how to implement"
  }
]
`;
  }

  buildPredictionsPrompt(clientData) {
    return `
Using this client's historical data, predict future behavior:

${JSON.stringify(clientData, null, 2)}

Provide predictions for:
1. Next booking probability (0-100%)
2. Estimated lifetime value ($)
3. Churn risk (0-100%)
4. Best contact time and day
5. Preferred service types
6. Seasonal patterns

Format as JSON:
{
  "nextBookingProbability": number,
  "lifetimeValue": number,
  "churnRisk": number,
  "bestContactTime": "time range",
  "preferredServices": ["service1", "service2"],
  "seasonalPatterns": ["pattern1", "pattern2"],
  "confidence": number
}
`;
  }

  // Parse AI responses
  parseAIResponse(text) {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    return null;
  }

  parseComprehensiveReport(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing comprehensive report:', error);
    }
    return null;
  }

  parseRecommendations(text) {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing recommendations:', error);
    }
    return [];
  }

  parsePredictions(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing predictions:', error);
    }
    return null;
  }

  // Fallback methods when AI is unavailable
  getFallbackAnalysis(clientData) {
    const bookings = clientData.bookings || [];
    const invoices = clientData.invoices || [];
    const totalSpent = clientData.totalSpent || 0;
    const pastDue = clientData.pastDue || 0;

    // Calculate basic scores
    let riskScore = 0;
    if (pastDue > 0) riskScore += Math.min(pastDue / 100, 30);
    if (bookings.length === 0) riskScore += 10;
    if (totalSpent < 100) riskScore += 5;
    riskScore = Math.min(riskScore, 100);

    let loyaltyScore = 0;
    loyaltyScore += Math.min(bookings.length * 5, 40);
    loyaltyScore += Math.min(totalSpent / 50, 30);
    loyaltyScore += pastDue === 0 ? 20 : -10;
    loyaltyScore += bookings.filter(b => b.status === 'completed').length * 2;
    loyaltyScore = Math.max(0, Math.min(loyaltyScore, 100));

    let engagementScore = 0;
    engagementScore += bookings.length * 3;
    engagementScore += invoices.length * 2;
    engagementScore += totalSpent > 0 ? 15 : 0;
    engagementScore = Math.min(engagementScore, 100);

    return {
      riskScore,
      loyaltyScore,
      engagementScore,
      insights: [
        `Client has ${bookings.length} total bookings`,
        `Total spending: $${totalSpent.toFixed(2)}`,
        pastDue > 0 ? 'Has outstanding balance' : 'Good payment history'
      ],
      summary: `${clientData.name} is a ${loyaltyScore > 70 ? 'loyal' : 'new'} client with ${riskScore > 50 ? 'some' : 'low'} risk factors.`
    };
  }

  getFallbackReport(clientData) {
    return {
      executiveSummary: `Analysis of ${clientData.name}'s account history and patterns`,
      riskAssessment: {
        paymentRisk: clientData.pastDue > 0 ? 'medium' : 'low',
        churnRisk: clientData.bookings?.length > 3 ? 'low' : 'medium',
        complianceRisk: 'low'
      },
      valueAnalysis: {
        lifetimeValue: (clientData.totalSpent || 0) * 2.5,
        growthPotential: clientData.bookings?.length > 1 ? 'high' : 'medium'
      },
      recommendations: [
        'Continue regular service scheduling',
        'Maintain current communication frequency',
        'Consider seasonal service packages'
      ]
    };
  }

  getFallbackRecommendations(clientData) {
    const recommendations = [];
    
    if (clientData.bookings?.length === 0) {
      recommendations.push({
        category: 'service',
        priority: 'high',
        action: 'Send welcome email with special offer',
        expectedOutcome: 'Increase first booking conversion',
        implementation: 'Automated email campaign'
      });
    }

    if (clientData.totalSpent > 1000) {
      recommendations.push({
        category: 'upselling',
        priority: 'medium',
        action: 'Offer loyalty discount program',
        expectedOutcome: 'Increase repeat business',
        implementation: 'Create tiered discount structure'
      });
    }

    if (clientData.pastDue > 0) {
      recommendations.push({
        category: 'risk',
        priority: 'high',
        action: 'Send payment reminder with flexible options',
        expectedOutcome: 'Reduce overdue amounts',
        implementation: 'Automated payment reminders'
      });
    }

    return recommendations;
  }

  getFallbackPredictions(clientData) {
    const bookings = clientData.bookings || [];
    const totalSpent = clientData.totalSpent || 0;

    return {
      nextBookingProbability: bookings.length > 3 ? 75 : bookings.length > 0 ? 50 : 25,
      lifetimeValue: totalSpent * 2.5,
      churnRisk: bookings.length > 5 ? 10 : bookings.length > 0 ? 25 : 40,
      bestContactTime: 'Tuesday 2-4 PM',
      preferredServices: ['junk removal', 'cleaning'],
      seasonalPatterns: ['spring cleaning', 'fall cleanup'],
      confidence: 0.7
    };
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export the AIService class
export default AIService;
