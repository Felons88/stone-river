import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Mail, Send, Loader2, Eye, Code, Sparkles, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface EnhancedEmailComposerProps {
  client: any;
  onClose: () => void;
}

// Import email templates
const emailTemplates = {
  bookingConfirmation: {
    name: 'Booking Confirmation',
    subject: '✅ Booking Confirmed',
    category: 'Bookings',
    preview: 'Confirm customer booking details',
  },
  onTheWay: {
    name: 'Team On The Way',
    subject: '🚛 We\'re On Our Way!',
    category: 'Bookings',
    preview: 'Notify customer team is en route',
  },
  runningLate: {
    name: 'Running Late',
    subject: '⏱️ Running a Few Minutes Late',
    category: 'Bookings',
    preview: 'Inform customer of delay',
  },
  jobComplete: {
    name: 'Job Completed',
    subject: '✨ Service Complete',
    category: 'Bookings',
    preview: 'Thank customer for completed service',
  },
  invoiceReady: {
    name: 'Invoice Ready',
    subject: '💰 Your Invoice is Ready',
    category: 'Invoices',
    preview: 'Send invoice to customer',
  },
  paymentReceived: {
    name: 'Payment Received',
    subject: '✅ Payment Received',
    category: 'Invoices',
    preview: 'Confirm payment received',
  },
  paymentReminder: {
    name: 'Payment Reminder',
    subject: '💳 Friendly Payment Reminder',
    category: 'Invoices',
    preview: 'Remind customer of due payment',
  },
  thankYou: {
    name: 'Thank You',
    subject: '💙 Thank You!',
    category: 'Customer Service',
    preview: 'Express gratitude to customer',
  },
  feedbackRequest: {
    name: 'Feedback Request',
    subject: '⭐ How Did We Do?',
    category: 'Customer Service',
    preview: 'Request customer feedback',
  },
  seasonalPromo: {
    name: 'Seasonal Promotion',
    subject: '🎁 Special Offer Just for You!',
    category: 'Promotions',
    preview: 'Send promotional offer',
  },
  passwordReset: {
    name: 'Password Reset',
    subject: '🔐 Reset Your Password',
    category: 'Account',
    preview: 'Send password reset instructions',
  },
  weatherDelay: {
    name: 'Weather Delay',
    subject: '⛈️ Weather Update',
    category: 'Urgent',
    preview: 'Notify of weather-related delay',
  },
};

const categories = ['All', 'Bookings', 'Invoices', 'Customer Service', 'Promotions', 'Account', 'Urgent'];

const EnhancedEmailComposer = ({ client, onClose }: EnhancedEmailComposerProps) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showTemplates, setShowTemplates] = useState(true);
  const [realETA, setRealETA] = useState<string | null>(null);
  const [realDistance, setRealDistance] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [staffName, setStaffName] = useState<string>('');

  useEffect(() => {
    // Load staff name from localStorage
    const savedName = localStorage.getItem('staffName');
    if (savedName) {
      setStaffName(savedName);
    }
  }, []);

  const filteredTemplates = Object.entries(emailTemplates).filter(([key, template]) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const calculateRealETA = async () => {
    // Get GPS location
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });

        const driverLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDriverLocation(driverLoc);

        // Calculate ETA using Google Maps API
        const destination = client.address || client.service_address || client.city;
        if (destination) {
          const response = await fetch('http://localhost:3001/api/maps/calculate-eta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: `${driverLoc.lat},${driverLoc.lng}`,
              destination: destination,
            }),
          });

          const data = await response.json();
          if (data.success) {
            setRealETA(data.duration_text);
            setRealDistance(data.distance_text);
          }
        }
      } catch (error) {
        console.error('Error calculating real ETA:', error);
      }
    }
  };

  const handleSelectTemplate = async (templateKey: string) => {
    const template = emailTemplates[templateKey as keyof typeof emailTemplates];
    setSelectedTemplate(templateKey);
    setSubject(template.subject);
    setShowTemplates(false);
    
    // Get staff name if not set
    let currentStaffName = staffName;
    if (!currentStaffName) {
      const name = prompt('Enter your name (for email signature):');
      if (name) {
        currentStaffName = name;
        setStaffName(name);
        localStorage.setItem('staffName', name);
      }
    }

    // Generate initial template HTML
    let html = generateTemplateHTML(templateKey);
    setMessage(html);

    // Calculate real ETA for location-based templates
    if (templateKey === 'onTheWay' || templateKey === 'runningLate') {
      await calculateRealETA();
      // Regenerate template with real data after calculation
      setTimeout(() => {
        const updatedHtml = generateTemplateHTML(templateKey);
        setMessage(updatedHtml);
      }, 100);
    }
  };

  // Watch for changes in realETA, realDistance, or staffName and regenerate template
  useEffect(() => {
    if (selectedTemplate && (realETA || realDistance)) {
      const html = generateTemplateHTML(selectedTemplate);
      setMessage(html);
    }
  }, [realETA, realDistance, staffName]);

  const generateTemplateHTML = (templateKey: string) => {
    const baseHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .info-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #e5e7eb; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">${emailTemplates[templateKey as keyof typeof emailTemplates].name}</h1>
    </div>
    <div class="content">
      <p>Hi ${client.name},</p>
      ${getTemplateContent(templateKey)}
      <div class="footer">
        <p>StoneRiver Junk Removal</p>
        <p>📞 (612) 685-4696 | 📧 info@stoneriverjunk.com</p>
      </div>
    </div>
  </div>
</body>
</html>`;
    return baseHTML;
  };

  const getTemplateContent = (templateKey: string) => {
    // Get today's date for realistic previews
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const templates: Record<string, string> = {
      bookingConfirmation: `
        <h2 style="color: #2563eb;">Booking Confirmed!</h2>
        <p>Great news! Your booking has been confirmed.</p>
        <div class="info-box">
          <strong>Service:</strong> Junk Removal<br>
          <strong>Date:</strong> ${tomorrow.toLocaleDateString()}<br>
          <strong>Time:</strong> 10:00 AM - 12:00 PM<br>
          <strong>Address:</strong> ${client.address || client.service_address || '123 Main St, Minneapolis, MN'}
        </div>
        <p>We'll send you a reminder 24 hours before your appointment.</p>
      `,
      onTheWay: `
        <h2 style="color: #10b981;">Our Team is Heading to You!</h2>
        <p>Good news! Our team has left and is on the way to your location.</p>
        <div class="info-box">
          <strong>Estimated Arrival:</strong> ${realETA || 'Calculating...'}<br>
          <strong>Distance:</strong> ${realDistance || 'Calculating...'}<br>
          <strong>Team Lead:</strong> ${staffName || 'Your StoneRiver Team'}<br>
          <strong>Contact:</strong> (612) 685-4696
        </div>
        ${driverLocation ? `<p style="font-size: 12px; color: #6b7280;">📍 Current location: ${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}</p>` : ''}
        <p>See you soon!</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">📍 Live tracking enabled - we'll keep you updated!</p>
      `,
      runningLate: `
        <h2 style="color: #f59e0b;">Quick Update</h2>
        <p>We wanted to let you know that we're running behind schedule due to traffic conditions.</p>
        <div class="info-box">
          <strong>Current ETA:</strong> ${realETA || 'Calculating...'}<br>
          <strong>Distance Remaining:</strong> ${realDistance || 'Calculating...'}<br>
          <strong>Team Lead:</strong> ${staffName || 'Your StoneRiver Team'}
        </div>
        ${driverLocation ? `<p style="font-size: 12px; color: #6b7280;">📍 Current location: ${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}</p>` : ''}
        <p>We apologize for the inconvenience and appreciate your patience!</p>
      `,
      jobComplete: `
        <h2 style="color: #10b981;">Job Complete!</h2>
        <p>Thank you for choosing StoneRiver Junk Removal! Your service has been completed.</p>
        <div class="info-box">
          <strong>Service:</strong> Junk Removal<br>
          <strong>Completed:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Items Removed:</strong> Furniture, appliances, and misc items
        </div>
        <p>We'd love to hear about your experience!</p>
        <a href="https://stoneriverjunk.com/reviews" class="button">Leave a Review</a>
      `,
      invoiceReady: `
        <h2 style="color: #2563eb;">Invoice Ready</h2>
        <p>Your invoice for the recent service is now ready.</p>
        <div class="info-box">
          <strong>Invoice #:</strong> INV-${Math.floor(1000 + Math.random() * 9000)}<br>
          <strong>Amount Due:</strong> $350.00<br>
          <strong>Due Date:</strong> ${nextWeek.toLocaleDateString()}
        </div>
        <a href="#" class="button">View & Pay Invoice</a>
      `,
      paymentReceived: `
        <h2 style="color: #10b981;">Payment Received!</h2>
        <p>Thank you! We've received your payment.</p>
        <div class="info-box">
          <strong>Amount Paid:</strong> $350.00<br>
          <strong>Payment Date:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Payment Method:</strong> Credit Card
        </div>
        <p>A receipt has been sent to your email.</p>
      `,
      paymentReminder: `
        <h2 style="color: #f97316;">Payment Reminder</h2>
        <p>This is a friendly reminder that payment is due soon.</p>
        <div class="info-box">
          <strong>Amount Due:</strong> $350.00<br>
          <strong>Due Date:</strong> ${nextWeek.toLocaleDateString()}
        </div>
        <a href="#" class="button">Pay Now</a>
      `,
      thankYou: `
        <h2 style="color: #10b981;">Thank You!</h2>
        <p>We wanted to take a moment to thank you for choosing StoneRiver Junk Removal.</p>
        <p>Your satisfaction is our top priority!</p>
        <p>Need us again? You get <strong>10% off</strong> your next service as a returning customer!</p>
      `,
      feedbackRequest: `
        <h2 style="color: #f97316;">We'd Love Your Feedback!</h2>
        <p>How was your experience with StoneRiver? Your feedback helps us improve!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://stoneriverjunk.com/reviews" class="button">⭐ Leave a Review</a>
        </div>
      `,
      seasonalPromo: `
        <div style="background: linear-gradient(135deg, #2563eb 0%, #f97316 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; font-size: 48px;">20% OFF</h1>
          <p style="font-size: 24px; margin: 10px 0;">Spring Cleaning Special</p>
          <p>Use code: <strong>SPRING2026</strong></p>
        </div>
        <p>Valid until ${nextWeek.toLocaleDateString()}. Book now to save!</p>
        <a href="https://stoneriverjunk.com/booking" class="button">Book Now</a>
      `,
      passwordReset: `
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>We received a request to reset your password. Your new temporary password is:</p>
        <div class="info-box" style="text-align: center;">
          <code style="font-size: 24px; font-weight: bold;">Temp${Math.floor(1000 + Math.random() * 9000)}</code>
        </div>
        <p><strong>Important:</strong> Please change this password after logging in.</p>
        <a href="https://stoneriverjunk.com/portal/login" class="button">Login to Portal</a>
      `,
      weatherDelay: `
        <h2 style="color: #f59e0b;">Weather Update</h2>
        <p>Due to severe weather conditions, we need to reschedule your service for safety reasons.</p>
        <div class="info-box">
          <strong>Original Date:</strong> ${tomorrow.toLocaleDateString()}<br>
          <strong>New Date:</strong> ${nextWeek.toLocaleDateString()}<br>
          <strong>Reason:</strong> Severe thunderstorm warning
        </div>
        <p>We apologize for the inconvenience. Your safety and our team's safety are our top priorities.</p>
      `,
    };
    
    return templates[templateKey] || '<p>Template content here...</p>';
  };

  const handleSend = async () => {
    if (!subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in subject and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('http://localhost:3001/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: client.email,
          subject,
          html: message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Email Sent!",
          description: `Email sent to ${client.name}`,
        });
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
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
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-black text-gray-900">Send Email to {client.name}</h2>
              <p className="text-sm text-gray-600">{client.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Template Sidebar */}
          {showTemplates && (
            <div className="w-80 border-r-2 border-gray-200 overflow-y-auto p-4">
              <div className="mb-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        selectedCategory === cat
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filteredTemplates.map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === key
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-bold text-sm text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{template.preview}</div>
                    <div className="text-xs text-primary mt-2">{template.category}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {!showTemplates && (
                <Button
                  onClick={() => setShowTemplates(true)}
                  variant="outline"
                  size="sm"
                  className="mb-4"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Choose Different Template
                </Button>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div className="flex gap-2 mb-2">
                <Button
                  onClick={() => setViewMode('edit')}
                  variant={viewMode === 'edit' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Edit HTML
                </Button>
                <Button
                  onClick={() => setViewMode('preview')}
                  variant={viewMode === 'preview' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>

              {viewMode === 'edit' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message (HTML)</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Email content (HTML)..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preview</label>
                  <div 
                    className="border-2 border-gray-200 rounded-lg p-4 min-h-[400px] bg-white overflow-auto"
                    dangerouslySetInnerHTML={{ __html: message }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t-2 border-gray-200 flex justify-end gap-3">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-primary hover:bg-primary/90 font-bold"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedEmailComposer;
