import { MessageSquare } from "lucide-react";

const ContactsManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Contacts Management</h2>
        <p className="text-gray-600 mt-1">Manage contact form submissions</p>
      </div>
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Contacts management coming soon</p>
      </div>
    </div>
  );
};

export default ContactsManager;
