import { Gift, Users } from "lucide-react";

const ReferralsManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Referrals Management</h2>
        <p className="text-gray-600 mt-1">Track and manage referral program</p>
      </div>
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Referrals management coming soon</p>
      </div>
    </div>
  );
};

export default ReferralsManager;
