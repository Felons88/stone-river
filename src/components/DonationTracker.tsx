import { useState, useEffect } from 'react';
import { Heart, Leaf, TrendingUp, Award, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import DonationScanner from './DonationScanner';

interface DonationTrackerProps {
  showFullDashboard?: boolean;
}

interface DisposalPartner {
  id: string;
  partner_name: string;
  partner_type: string;
  address: string;
  phone: string;
  accepted_items: string[];
  tax_deductible: boolean;
}

interface DisposalLog {
  id: string;
  item_category: string;
  quantity: number;
  weight_lbs: number;
  disposal_method: string;
  partner_id: string;
  created_at: string;
}

const DonationTracker = ({ showFullDashboard = true }: DonationTrackerProps) => {
  const [partners, setPartners] = useState<DisposalPartner[]>([]);
  const [logs, setLogs] = useState<DisposalLog[]>([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalRecycled: 0,
    totalDiverted: 0,
    co2Saved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load partners
      const { data: partnersData } = await supabase
        .from('disposal_partners')
        .select('*')
        .eq('is_active', true)
        .order('partner_name');

      // Load disposal logs
      const { data: logsData } = await supabase
        .from('disposal_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setPartners(partnersData || []);
      setLogs(logsData || []);

      // Calculate stats
      if (logsData) {
        const donated = logsData.filter(log => log.disposal_method === 'donate').reduce((sum, log) => sum + (log.weight_lbs || 0), 0);
        const recycled = logsData.filter(log => log.disposal_method === 'recycle').reduce((sum, log) => sum + (log.weight_lbs || 0), 0);
        const diverted = donated + recycled;
        const co2 = diverted * 0.5; // Rough estimate: 0.5 lbs CO2 saved per lb diverted

        setStats({
          totalDonated: donated,
          totalRecycled: recycled,
          totalDiverted: diverted,
          co2Saved: co2,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading environmental impact data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Donation Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">Donation Tracking</h2>
        <Button
          onClick={() => setShowScanner(!showScanner)}
          className="bg-primary hover:bg-primary/90 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Donation
        </Button>
      </div>

      {/* Donation Scanner */}
      {showScanner && (
        <DonationScanner
          onScanComplete={(items) => {
            setShowScanner(false);
            loadData(); // Refresh data after scan
          }}
        />
      )}

      {/* Environmental Impact Dashboard */}
      {showFullDashboard && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            Environmental Impact
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4">
              <Heart className="w-8 h-8 text-red-500 mb-2" />
              <div className="text-3xl font-black text-gray-900">{stats.totalDonated.toLocaleString()}</div>
              <div className="text-sm text-gray-600">lbs Donated</div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <Leaf className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-3xl font-black text-gray-900">{stats.totalRecycled.toLocaleString()}</div>
              <div className="text-sm text-gray-600">lbs Recycled</div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-3xl font-black text-gray-900">{stats.totalDiverted.toLocaleString()}</div>
              <div className="text-sm text-gray-600">lbs Diverted from Landfill</div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <Award className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-3xl font-black text-gray-900">{stats.co2Saved.toLocaleString()}</div>
              <div className="text-sm text-gray-600">lbs CO₂ Saved</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-xl">
            <p className="text-gray-700 text-center">
              <span className="font-black text-green-600 text-2xl">{((stats.totalDiverted / (stats.totalDiverted + 1000)) * 100).toFixed(1)}%</span>
              {' '}of our junk is diverted from landfills through donations and recycling
            </p>
          </div>
        </div>
      )}

      {/* Donation Partners */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4">Our Donation & Recycling Partners</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {partners.map((partner) => (
            <div key={partner.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{partner.partner_name}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${
                    partner.partner_type === 'donation' ? 'bg-red-100 text-red-700' :
                    partner.partner_type === 'recycling' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {partner.partner_type}
                  </span>
                </div>
                {partner.tax_deductible && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    Tax Deductible
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {partner.address && (
                  <p className="text-gray-600">📍 {partner.address}</p>
                )}
                {partner.phone && (
                  <p className="text-gray-600">📞 {partner.phone}</p>
                )}
                {partner.accepted_items && partner.accepted_items.length > 0 && (
                  <div>
                    <p className="text-gray-600 font-semibold mb-1">Accepts:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.accepted_items.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {partners.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No partners configured yet</p>
          </div>
        )}
      </div>

      {/* Recent Donations/Recycling */}
      {showFullDashboard && logs.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            {logs.slice(0, 10).map((log) => {
              const partner = partners.find(p => p.id === log.partner_id);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.disposal_method === 'donate' ? 'bg-red-100' :
                      log.disposal_method === 'recycle' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {log.disposal_method === 'donate' ? '🎁' :
                       log.disposal_method === 'recycle' ? '♻️' : '🗑️'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{log.item_category}</p>
                      <p className="text-sm text-gray-600">
                        {partner?.partner_name || 'Unknown Partner'} • {log.weight_lbs} lbs
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-6 text-white text-center">
        <h3 className="text-2xl font-black mb-3">Making a Difference Together</h3>
        <p className="text-white/90 mb-4">
          Every item we donate or recycle helps reduce waste and support our community.
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <div>
            <div className="text-3xl font-black">{partners.filter(p => p.partner_type === 'donation').length}</div>
            <div className="text-white/80">Donation Partners</div>
          </div>
          <div>
            <div className="text-3xl font-black">{partners.filter(p => p.partner_type === 'recycling').length}</div>
            <div className="text-white/80">Recycling Partners</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationTracker;
