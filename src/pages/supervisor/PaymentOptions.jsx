import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Ticket } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const PaymentOptions = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" icon={<ArrowLeft />} onClick={() => navigate('/app/supervisor/cases')} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Options</h1>
          <p className="text-sm text-gray-600">Choose payment method for case #{caseId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-500">
          <div className="text-center p-6">
            <CreditCard className="w-16 h-16 mx-auto text-primary-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Direct Payment</h3>
            <p className="text-sm text-gray-600 mb-4">Pay with Stripe</p>
            <Button fullWidth>Select</Button>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-500">
          <div className="text-center p-6">
            <Ticket className="w-16 h-16 mx-auto text-orange-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Redeem Coupon</h3>
            <p className="text-sm text-gray-600 mb-4">Use available coupon</p>
            <Button variant="outline" fullWidth>Select</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentOptions;
