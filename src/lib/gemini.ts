import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const gemini = {
  // Generate blog post content
  generateBlogPost: async (topic: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic}" for a junk removal company in Central Minnesota. 

Include:
- Engaging title
- 500-800 word article
- Brief excerpt (2-3 sentences)
- URL-friendly slug
- Practical tips and advice
- Local Minnesota context where relevant

Format as JSON with keys: title, content, excerpt, slug, category, tags (array)`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if not JSON
      return {
        title: `${topic} - Complete Guide`,
        content: text,
        excerpt: text.substring(0, 200) + '...',
        slug: topic.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        category: 'tips',
        tags: ['junk removal', 'tips', 'guide']
      };
    } catch (error) {
      console.error('Gemini blog generation error:', error);
      throw error;
    }
  },

  // Generate review response
  generateReviewResponse: async (reviewText: string, rating: number) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Generate a professional, friendly response to this ${rating}-star customer review for StoneRiver Junk Removal:

"${reviewText}"

Requirements:
- Thank the customer by name if mentioned
- Address specific points they mentioned
- Keep it under 100 words
- Professional but warm tone
- Mention StoneRiver by name
- For 5 stars: express gratitude
- For 4 stars: thank them and mention improvement
- For 3 stars or below: apologize and offer to make it right with contact info (612) 685-4696`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini review response error:', error);
      throw error;
    }
  },

  // Categorize contact inquiry
  categorizeContact: async (message: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Categorize this customer inquiry into ONE category:

Message: "${message}"

Categories:
- quote_request: asking for pricing or estimates
- booking: wants to schedule service
- service_question: asking about what services we offer
- area_question: asking if we service their location
- support: has a problem or complaint
- general: anything else

Respond with ONLY the category name, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim().toLowerCase();
      
      // Validate category
      const validCategories = ['quote_request', 'booking', 'service_question', 'area_question', 'support', 'general'];
      return validCategories.includes(category) ? category : 'general';
    } catch (error) {
      console.error('Gemini categorization error:', error);
      return 'general';
    }
  },

  // Generate response suggestion
  suggestResponse: async (inquiry: string, category: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Generate a helpful response to this customer inquiry for StoneRiver Junk Removal:

Inquiry: "${inquiry}"
Category: ${category}

Company Info:
- Phone: (612) 685-4696
- Email: info@stoneriverjunk.com
- Service Area: Central Minnesota
- Pricing: $150-$450 based on truck load
- Same-day service available

Requirements:
- Professional and friendly
- Under 150 words
- Include relevant contact info
- Provide specific next steps
- Mention online booking at website if relevant`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini response suggestion error:', error);
      throw error;
    }
  },

  // Generate SMS notification message
  generateSMSMessage: async (type: 'confirmation' | 'reminder' | 'on_way' | 'complete' | 'custom', bookingData: any) => {
    try {
      console.log('Gemini: Starting SMS generation', { type, bookingData });
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      let prompt = '';
      
      switch (type) {
        case 'confirmation':
          prompt = `Write a booking confirmation SMS for StoneRiver Junk Removal.

Customer: ${bookingData.name}
Date: ${bookingData.preferred_date || 'Today'}
Time: ${bookingData.preferred_time || '2:00 PM'}
Address: ${bookingData.address || 'Customer location'}

Requirements:
- MAXIMUM 160 characters (strict limit)
- Start with "You're all set! ✅"
- Include the actual date: ${bookingData.preferred_date || 'Today'}
- Include the actual time: ${bookingData.preferred_time || '2:00 PM'}
- Say we'll text when on the way
- Mention they can reply if anything changes
- Professional but friendly tone
- Include relevant emojis (✅)
- MUST be under 160 characters total`;
          break;

        case 'reminder':
          prompt = `Write a reminder SMS for StoneRiver Junk Removal.

Customer: ${bookingData.name}
Date: ${bookingData.preferred_date || 'Tomorrow'}
Time: ${bookingData.preferred_time || '2:00 PM'}
Service: ${bookingData.service_type || 'junk removal'}

Requirements:
- MAXIMUM 160 characters (strict limit)
- Start with "Hey ${bookingData.name},"
- Mention the appointment at ${bookingData.preferred_date || 'Tomorrow'} at ${bookingData.preferred_time || '2:00 PM'}
- Say we'll text when 30 mins away
- Professional but friendly tone
- Include relevant emojis (🚛)
- MUST be under 160 characters total`;
          break;

        case 'on_way':
          prompt = `Write an on-the-way SMS for StoneRiver Junk Removal.

Customer: ${bookingData.name}
Address: ${bookingData.address || 'Customer location'}
ETA: 30 minutes

Requirements:
- MAXIMUM 160 characters (strict limit)
- Start with "Hi ${bookingData.name}, this is StoneRiver Junk Removal"
- Say we're on the way now
- Mention ETA of approximately 30 minutes to ${bookingData.address || 'your location'}
- Professional but friendly tone
- Include relevant emojis (🚚)
- MUST be under 160 characters total`;
          break;

        case 'complete':
          prompt = `Write a completion SMS for StoneRiver Junk Removal.

Customer: ${bookingData.name}
Service: ${bookingData.service_type || 'junk removal'}

Requirements:
- MAXIMUM 160 characters (strict limit)
- Start with "Thanks for choosing StoneRiver Junk Removal!"
- Thank ${bookingData.name} for their business
- Ask them to rate their experience
- Professional and appreciative tone
- Include relevant emojis (🙏)
- MUST be under 160 characters total`;
          break;

        case 'custom':
          prompt = `Write a professional SMS for StoneRiver Junk Removal.

Customer: ${bookingData.name}
Topic: ${bookingData.message || 'General communication'}
Service: ${bookingData.service_type || 'junk removal'}
Next available: ${bookingData.preferred_date || 'Today'} at ${bookingData.preferred_time || '2:00 PM'}
Phone: (612) 685-4696

Requirements:
- MAXIMUM 160 characters (strict limit)
- Start with "Hi ${bookingData.name}," or "Hey ${bookingData.name},"
- Include relevant emojis (👋 🚛 📸 ✅ 🚚 🙏 🚨)
- Address the topic: ${bookingData.message || 'General communication'}
- Include call-to-action with actual phone number (612) 685-4696
- Professional but friendly tone
- Mention next availability if relevant
- NO placeholder text like [link] or [phone number]
- MUST be under 160 characters total`;
          break;
      }

      console.log('Gemini: Prompt for SMS generation', prompt);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let message = response.text().trim();
      console.log('Gemini: Raw AI response', message);
      
      // Ensure it's under 160 characters (strict limit)
      if (message.length > 160) {
        message = message.substring(0, 160);
      }

      console.log('Gemini: Final SMS message', message);
      return message;
    } catch (error) {
      console.error('Gemini SMS generation error:', error);
      throw error;
    }
  },

  // Analyze customer sentiment
  analyzeSentiment: async (text: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Analyze the sentiment of this customer message:

"${text}"

Respond with JSON containing:
- sentiment: "positive", "neutral", or "negative"
- confidence: 0-100
- urgency: "low", "medium", or "high"
- suggested_action: brief recommendation`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      const jsonMatch = text_response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        sentiment: 'neutral',
        confidence: 50,
        urgency: 'medium',
        suggested_action: 'Review and respond'
      };
    } catch (error) {
      console.error('Gemini sentiment analysis error:', error);
      throw error;
    }
  },

  // Generate FAQ answer
  generateFAQAnswer: async (question: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Answer this FAQ for StoneRiver Junk Removal:

Question: "${question}"

Company Info:
- Service: Residential, Commercial, Demolition junk removal
- Area: Central Minnesota (St. Cloud and surrounding)
- Pricing: $150-$450 based on load size
- Phone: (612) 685-4696
- Same-day service available
- Eco-friendly: recycle and donate when possible

Provide a clear, helpful answer under 100 words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini FAQ generation error:', error);
      throw error;
    }
  },

  // Generate meta description for SEO
  generateMetaDescription: async (pageContent: string, pageName: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Generate an SEO-optimized meta description for this page:

Page: ${pageName}
Content preview: ${pageContent.substring(0, 500)}

Requirements:
- 150-160 characters
- Include "StoneRiver Junk Removal"
- Include "Central Minnesota"
- Action-oriented
- Include key benefit`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().substring(0, 160);
    } catch (error) {
      console.error('Gemini meta description error:', error);
      throw error;
    }
  },
};

export default gemini;
