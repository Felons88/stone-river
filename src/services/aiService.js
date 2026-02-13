import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCfwsggzyCCEzXG-kvEhut1oThptWZbeuk');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

class AIService {
  constructor() {
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
      const result = await model.generateContent(prompt);
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

  // Generate comprehensive AI report
  async generateComprehensiveReport(clientData) {
    try {
      const prompt = this.buildComprehensiveReportPrompt(clientData);
      const result = await model.generateContent(prompt);
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
      const result = await model.generateContent(prompt);
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
      const result = await model.generateContent(prompt);
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

export default new AIService();
