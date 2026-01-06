import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Ticket } from 'lucide-react';
import Card, { StatsCard } from '../../components/common/Card';
import { fetchCouponSummary, selectSupervisorCoupons } from '../../store/slices/supervisorSlice';

const CouponManagement = () => {
  const dispatch = useDispatch();
  const couponSummary = useSelector(selectSupervisorCoupons);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      await dispatch(fetchCouponSummary());
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage coupons for your patients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Coupons"
          value={couponSummary.totalCoupons}
          icon={<Ticket />}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Available"
          value={couponSummary.availableCoupons}
          icon={<Ticket />}
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Used"
          value={couponSummary.usedCoupons}
          icon={<Ticket />}
          iconColor="bg-gray-100 text-gray-600"
        />
        <StatsCard
          title="Expired"
          value={couponSummary.expiredCoupons}
          icon={<Ticket />}
          iconColor="bg-red-100 text-red-600"
        />
      </div>

      <Card>
        <p className="text-gray-600 text-center py-8">
          Detailed coupon management features are under development.
        </p>
      </Card>
    </div>
  );
};

export default CouponManagement;
