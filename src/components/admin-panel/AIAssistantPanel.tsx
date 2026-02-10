import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

const AIAssistantPanel = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generateContent = async (type: string) => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'blog':
          response = await api.ai.generateBlogPost(prompt);
          setResult(JSON.stringify(response, null, 2));
          break;
        case 'email':
          response = await api.ai.suggestResponse(prompt, 'email');
          setResult(response);
          break;
        case 'sms':
          response = await api.ai.generateSMSMessage('custom', { message: prompt });
          setResult(response);
          break;
        case 'categorize':
          response = await api.ai.categorizeContact(prompt);
          setResult(`Category: ${response}`);
          break;
      }
      toast({
        title: "Success",
        description: "Content generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">AI Assistant</h2>
        <p className="text-gray-600 mt-1">Powered by Google Gemini AI</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Content
          </h3>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your prompt... (e.g., 'Write a blog post about garage decluttering tips')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="font-medium"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => generateContent('blog')} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Blog Post
              </Button>
              <Button 
                onClick={() => generateContent('email')} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Email
              </Button>
              <Button 
                onClick={() => generateContent('sms')} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                SMS
              </Button>
              <Button 
                onClick={() => generateContent('categorize')} 
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Categorize
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4">AI Result</h3>
          <div className="bg-gray-50 rounded-xl p-4 min-h-[300px] font-mono text-sm whitespace-pre-wrap">
            {result || "AI-generated content will appear here..."}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6">
        <h3 className="text-lg font-black text-gray-900 mb-3">AI Capabilities</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="font-bold text-gray-900">Blog Post Generation</div>
              <div className="text-sm text-gray-600">Create SEO-optimized articles</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="font-bold text-gray-900">Email Responses</div>
              <div className="text-sm text-gray-600">Professional customer replies</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="font-bold text-gray-900">SMS Messages</div>
              <div className="text-sm text-gray-600">Automated notifications</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="font-bold text-gray-900">Smart Categorization</div>
              <div className="text-sm text-gray-600">Auto-classify inquiries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
