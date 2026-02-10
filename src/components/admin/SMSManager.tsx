import { Bell, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const SMSManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">SMS Management</h2>
          <p className="text-gray-600 mt-1">Send notifications and manage subscribers</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-bold">
          <Send className="w-4 h-4 mr-2" />
          Send SMS
        </Button>
      </div>
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">SMS management coming soon</p>
      </div>
    </div>
  );
};

export default SMSManager;
