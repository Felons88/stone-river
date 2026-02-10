import { useState } from "react";
import { motion } from "framer-motion";
import { X, MessageSquare, Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

interface SMSComposerProps {
  client: any;
  onClose: () => void;
}

const SMSComposer = ({ client, onClose }: SMSComposerProps) => {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const generateMessage = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter what the SMS is about",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Get client's latest booking for real data
      const bookings = await api.bookings.getAll();
      const clientBooking = bookings.find(b => b.email === client.email || b.phone === client.phone);
      
      const bookingData = {
        name: client.name,
        phone: client.phone,
        message: topic,
        preferred_date: clientBooking?.preferred_date || 'Today',
        preferred_time: clientBooking?.preferred_time || '2:00 PM',
        address: clientBooking?.address || client.address || 'Your location',
        service_type: clientBooking?.service_type || 'junk removal'
      };
      
      console.log('Generating SMS with real data:', bookingData);
      const generatedMessage = await api.ai.generateSMSMessage('custom', bookingData);
      console.log('Generated message:', generatedMessage);
      setMessage(generatedMessage);
      
      toast({
        title: "Success",
        description: "SMS template generated - you can edit it",
      });
    } catch (error: any) {
      console.error('SMS generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate message",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const sendSMS = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please generate or write a message first",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Log communication in database first
      await api.communications.create({
        client_id: client.id,
        type: 'sms',
        subject: topic || 'SMS Message',
        message: message,
        direction: 'outbound',
        status: 'sent'
      });

      // Use Google Voice to send SMS
      const googleVoice = await import('@/lib/googleVoice');
      await googleVoice.default.sendSMS({
        to: client.phone,
        message: message,
      });
      
      toast({
        title: "SMS Sent!",
        description: `Message sent to ${client.name} at ${client.phone}`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Google Voice SMS error:', error);
      toast({
        title: "SMS Error",
        description: error.message || "Failed to send SMS via Google Voice",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const characterCount = message.length;
  const smsCount = Math.ceil(characterCount / 160);

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
        className="bg-white rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">Send SMS</h3>
              <p className="text-sm text-gray-600">AI-powered message composer</p>
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
              <div className="text-sm font-bold text-gray-500 uppercase">Phone</div>
              <div className="text-lg font-black text-gray-900">{client.phone}</div>
            </div>
          </div>
        </div>

        {/* Topic Input */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            What is this SMS about?
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Appointment reminder, Follow-up, Special offer..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateMessage()}
              className="flex-1"
            />
            <Button
              onClick={generateMessage}
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

        {/* Message Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Message
          </label>
          <Textarea
            placeholder="Your SMS message will appear here... or type your own"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="font-medium resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {characterCount} characters • {smsCount} SMS {smsCount > 1 ? 'messages' : 'message'}
            </p>
            {characterCount > 160 && (
              <p className="text-xs text-orange-600 font-bold">
                ⚠️ Long message will be split
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={sendSMS}
            disabled={sending || !message.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 font-bold h-12"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send SMS
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
            Powered by Google Gemini AI - Messages are personalized and professional
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SMSComposer;
