import { useState } from "react";
import { Sparkles, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api-client";

const AIAssistant = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generateContent = async (type: string) => {
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'blog':
          response = await api.ai.generateBlogPost(prompt);
          setResult(JSON.stringify(response, null, 2));
          break;
        case 'review':
          response = await api.ai.generateReviewResponse(prompt);
          setResult(response);
          break;
        case 'categorize':
          response = await api.ai.categorizeContact(prompt);
          setResult(`Category: ${response}`);
          break;
        case 'suggest':
          response = await api.ai.suggestResponse(prompt);
          setResult(response);
          break;
      }
    } catch (error) {
      setResult("Error generating content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">AI Assistant</h2>
        <p className="text-gray-600 mt-1">AI-powered automation and content generation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Content
          </h3>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => generateContent('blog')} disabled={loading}>
                Generate Blog Post
              </Button>
              <Button onClick={() => generateContent('review')} disabled={loading}>
                Review Response
              </Button>
              <Button onClick={() => generateContent('categorize')} disabled={loading}>
                Categorize Contact
              </Button>
              <Button onClick={() => generateContent('suggest')} disabled={loading}>
                Suggest Response
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Result
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 min-h-[200px] font-mono text-sm">
            {result || "AI-generated content will appear here..."}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6">
        <h3 className="text-lg font-black text-gray-900 mb-3">AI Automation Features</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-gray-700 font-semibold">Auto-generate blog posts from topics</span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-gray-700 font-semibold">Smart categorization of customer inquiries</span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-gray-700 font-semibold">Automated review responses</span>
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-gray-700 font-semibold">Intelligent response suggestions</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AIAssistant;
