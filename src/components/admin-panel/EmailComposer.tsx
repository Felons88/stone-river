import { useState } from "react";
import { motion } from "framer-motion";
import { X, Mail, Sparkles, Send, Loader2, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

interface EmailComposerProps {
  client: any;
  onClose: () => void;
}

const EmailComposer = ({ client, onClose }: EmailComposerProps) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'preview'>('html');

  const generateEmail = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter what the email is about",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const inquiry = `Write a professional HTML email to ${client.name} about: ${topic}. 
      Format it as proper HTML with:
      - Professional styling with inline CSS
      - Proper headings and paragraphs
      - StoneRiver Junk Removal branding colors (blue: #2563eb, green: #10b981)
      - Clear call-to-action button
      - Contact information footer
      - Responsive design
      Make it look professional and modern.`;
      
      const generatedContent = await api.ai.suggestResponse(inquiry, 'email');
      
      setMessage(generatedContent);
      if (!subject) {
        setSubject(topic);
      }
      
      toast({
        title: "Success",
        description: "AI generated your HTML email",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate email",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in subject and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Log communication in database first
      await api.communications.create({
        client_id: client.id,
        type: 'email',
        subject: subject,
        message: message,
        direction: 'outbound',
        status: 'sent'
      });

      // Send via Brevo SMTP with HTML
      const { sendBrevoEmail } = await import('@/lib/emailService');
      
      const result = await sendBrevoEmail({
        to: client.email,
        subject: subject,
        html: message, // Send as HTML directly
        text: message.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() // Clean text version
      });

      toast({
        title: "Email Sent!",
        description: `HTML email sent to ${client.name} at ${client.email}`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Brevo email error:', error);
      toast({
        title: "Email Error",
        description: error.message || "Failed to send email via Brevo",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">Send Email</h3>
              <p className="text-sm text-gray-600">AI-powered email composer with Resend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase">Sending to</div>
              <div className="text-lg font-black text-gray-900">{client.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-500 uppercase">Email</div>
              <div className="text-lg font-black text-gray-900">{client.email}</div>
            </div>
          </div>
        </div>

        {/* Topic Input */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            What is this email about?
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Service quote, Follow-up, Thank you, Special offer..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateEmail()}
              className="flex-1"
            />
            <Button
              onClick={generateEmail}
              disabled={generating || !topic.trim()}
              className="bg-purple-600 hover:bg-purple-700 font-bold"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Enter or click the sparkle icon to generate with AI
          </p>
        </div>

        {/* Subject Line */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Subject Line
          </label>
          <Input
            placeholder="Email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Message Textarea with HTML/Preview Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-gray-700">
              Message
            </label>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('html')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                  viewMode === 'html'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-3 h-3 inline mr-1" />
                HTML
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3 h-3 inline mr-1" />
                Preview
              </button>
            </div>
          </div>
          
          {viewMode === 'html' ? (
            <Textarea
              placeholder="Your HTML email will appear here... or type your own HTML"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="font-mono text-sm resize-none"
            />
          ) : (
            <div 
              className="border-2 border-gray-200 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-white"
              dangerouslySetInnerHTML={{ __html: message || '<p class="text-gray-400">Preview will appear here...</p>' }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={sendEmail}
            disabled={sending || !message.trim() || !subject.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold h-12"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Email
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="font-bold"
          >
            Cancel
          </Button>
        </div>

        {/* AI Info */}
        <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-xs text-blue-800 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI + Brevo SMTP - Professional HTML emails with live preview
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailComposer;
