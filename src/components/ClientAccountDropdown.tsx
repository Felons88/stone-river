import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientAccountSettingsModal from './ClientAccountSettingsModal';
import { getAdminUser } from '@/lib/adminAuth';

interface ClientAccountDropdownProps {
  client: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

const ClientAccountDropdown = ({ client }: ClientAccountDropdownProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const adminUser = getAdminUser();
    setIsAdmin(!!adminUser);
  };

  if (!isAdmin) return null;

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 font-bold shadow-lg w-full"
      >
        <Settings className="w-4 h-4 mr-2" />
        Account Settings
      </Button>

      <ClientAccountSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={client}
      />
    </>
  );
};

export default ClientAccountDropdown;
